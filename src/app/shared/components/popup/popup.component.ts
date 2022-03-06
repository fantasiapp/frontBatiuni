import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, EventEmitter, HostListener, Injectable, Input, Sanitizer, SimpleChange, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { SafeResourceUrl } from "@angular/platform-browser";
import { Store } from "@ngxs/store";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Dimension, DimensionMenu } from "src/app/shared/common/classes";
import { ContextUpdate, TemplateContext, ViewComponent, ViewTemplate } from "../../common/types";
import { FileDownloader } from "../../services/file-downloader.service";
import { BasicFile } from "../filesUI/files.ui";
import { File, Mission } from "src/models/new/data.interfaces";
import { DataState } from "src/models/new/data.state";
import { FileViewer } from "../file-viewer/file-viewer.component";

const TRANSITION_DURATION = 200;

//extend to support components

@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIPopup extends DimensionMenu {
  constructor(private cd: ChangeDetectorRef, private componentFactoryResolver: ComponentFactoryResolver,
    private popupService: PopupService) {
    super();
  }

  @ViewChild('view', {read: ViewContainerRef, static: true})
  view!: ViewContainerRef;

  @ViewChild('delete', {read: TemplateRef, static: true})
  deletePost!: TemplateRef<any>;
  
  @ViewChild('sign', {read: TemplateRef, static: true})
  sign!: TemplateRef<any>;

  @Input()
  content?: Exclude<PopupView, ContextUpdate>;
  
  @Input()
  fromService: boolean = false;

  @Input()
  keepAlive: boolean = true;

  ngOnInit() {
    if ( !this.fromService ) return;
  
    this.popupService.popups$.pipe(takeUntil(this.destroy$)).subscribe(view => {
      if ( !view )
        return this.close();
      
      if ( !this.view ) return; //ignore
      this.view.clear();

      if ( view.type == 'predefined' || view.type == 'template' ) {
        this.content = view;
        const template = view.type == 'predefined' ? this[view.name] : view.template,
          context = view.context;

        this.view.createEmbeddedView(template, context);
      } else if ( view.type == 'component' ) {
        this.content = view;
        const factory = this.componentFactoryResolver.resolveComponentFactory(this.content.component),
          componentRef = this.view.createComponent(factory);
        
        if ( this.content.init )
          this.content.init(componentRef.instance);
      } else if ( view.type == 'context' ) {
        if ( this.content?.type == 'template' || this.content?.type == 'predefined' ) {
          const template = this.content.type == 'predefined' ? this[this.content.name] : this.content.template;
          this.content.context = view.context;
          this.view.createEmbeddedView(template, this.content.context);
        }
      }
      this.open = true;
      this.cd.markForCheck();
    });

    this.popupService.dimension$.pipe(takeUntil(this.destroy$)).subscribe(dimension => {
      this.dimension = dimension;
      this.cd.markForCheck();
    });
  }

  willClose = false;
  close() {
    this.willClose = true;
    setTimeout(() => {
      if ( !this.keepAlive ) this.view.clear();
      this.willClose = false;
      this.openChange.emit(this._open = false);
      if ( this.content?.close ){
        this.content.close();
      }
      this.cd.markForCheck();
    }, TRANSITION_DURATION);
  }

  //extends destroy, no multiple inheritance :(
  protected destroy$ = new Subject<void>();
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  signContract() {
    //signe le contrat ici
    console.log('signing contract');
  }

  openWindow(url: string) {
    window.open(url);
  }
};

export type PredefinedPopups<T = any> = {
  readonly type: 'predefined';
  name: 'deletePost' | 'sign';
  context?: TemplateContext;
};

export type PopupView = (ViewTemplate | ViewComponent | ContextUpdate | PredefinedPopups) & {
  close?: Function;
};

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  popups$ = new Subject<PopupView>();
  dimension$ = new Subject<Dimension>();
  defaultDimension: Dimension = {left: '20px', top: '30px', width: 'calc(100% - 40px)', height: 'calc(100% - 60px)'}

  constructor(private store: Store, private downloader: FileDownloader) {
  }

  show(view: PopupView, dimension?: Dimension) {
    this.popups$.next(view);
    this.dimension$.next({...this.defaultDimension, ...(dimension || {})});
  }

  openFile(file: BasicFile | File) {
    if ( !file.content ) {
      this.downloader.downloadFile((file as File).id!, true).subscribe(file => this.openFile(file));
      return;
    }
    
    let context = this.downloader.createFileContext(file);
    this.popups$.next({
      type: 'component',
      component: FileViewer,
      init: (viewer: FileViewer) => {
        viewer.fileContext = context;
      },
      close: () => {
        context.url && URL.revokeObjectURL(context.url);
      }
    });

    this.dimension$.next(this.defaultDimension);
    return true;
  }

  openDeletePostDialog(source?: Subject<boolean>) {
    this.popups$.next({
      type: 'predefined',
      name: 'deletePost',
      context: { $implicit: source }
    });
    source?.subscribe(console.log);
    this.dimension$.next({width: '100%', height: '200px', top: 'calc(50% - 100px)', left: '0'})
    return new EventEmitter;
  }

  openSignContractDialog(mission: Mission) {
    //envoyer la requete
    const file = this.downloader.downloadFile(mission.contract || 1),
      view = this.store.selectSnapshot(DataState.view);
    
    file.subscribe(file => {
      this.popups$.next({
        type: 'predefined',
        name: 'sign',
        context: {$implicit: {
        fileContext: this.downloader.createFileContext(file),
        signedByProfile: (mission.signedByCompany && view == 'PME') || (mission.signedBySubContractor && view == 'ST')
      }}});

      this.dimension$.next(this.defaultDimension);
    });

    return file;
  }

  hide() {
    this.popups$.next(undefined);
  }

  updateTemplate(context: ViewTemplate['context']) {
    this.popups$.next({type: 'context', context})
  }
};