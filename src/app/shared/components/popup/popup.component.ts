import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Injectable, Input, Sanitizer, SimpleChange, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Store } from "@ngxs/store";
import { Subject } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { Dimension, DimensionMenu, UIOpenMenu } from "src/app/shared/common/classes";
import { DataQueries } from "src/models/new/data.state";
import { DownloadFile } from "src/models/new/user/user.actions";
import { b64toBlob, getFileType } from "../../common/functions";
import { TemplateContext } from "../../common/types";
import { FileDownloader } from "../../services/file-downloader.service";
import { BasicFile, FileUIOutput } from "../filesUI/files.ui";
import { File } from "src/models/new/data.interfaces";

const TRANSITION_DURATION = 200;
@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIPopup extends DimensionMenu {
  constructor(private cd: ChangeDetectorRef, private popupService: PopupService) {
    super();
  }

  @ViewChild('view', {read: ViewContainerRef, static: true})
  view!: ViewContainerRef;

  @ViewChild('file', {read: TemplateRef, static: true})
  file!: TemplateRef<any>;

  @ViewChild('delete', {read: TemplateRef, static: true})
  deletePost!: TemplateRef<any>;

  @Input()
  content?: TemplateRef<any>;
  
  @Input()
  params?: any;

  @Input()
  fromService: boolean = false;

  @Input()
  keepAlive: boolean = true;

  ngOnChanges(changes: SimpleChanges) {
    if ( changes['content'] || changes['params'] )
      this.show();
  }

  private show() {
    this.view.clear();
    if ( this.content ) {
      this.view.createEmbeddedView(this.content, this.params);
      this.open = true;
    } else
      this.open = false;
  }

  output: Subject<any> | null = null;

  ngOnInit() {
    if ( !this.fromService ) return;
  
    this.popupService.popups$.pipe(takeUntil(this.destroy$)).subscribe((params: Partial<PopupConfig>) => {
      this.params = params.context;
      this.content = params.template;
      if ( params.name && !this.content) {
        this.content = this[params.name];
        if ( params.output ) this.output = params.output;
      }
      this.show();
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
      this.output = null;
      if ( this.params?.close ) this.params.close();
      this.cd.markForCheck();
    }, TRANSITION_DURATION);
  }

  //extends destroy, no multiple inheritance :(
  protected destroy$ = new Subject<void>();
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openWindow(url: string) {
    window.open(url);
  }
};

export type PopupConfig<T = any> = {
  name: 'file' | 'deletePost';
  template: TemplateRef<any>;
  context: TemplateContext;
  output: Subject<T> | null;
};

export type FileViewConfig = {
  $implicit: {
    close: Function;
    url: string | null;
    safeUrl: SafeResourceUrl | null,
    type: string,
  }
};

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  popups$ = new Subject<Partial<PopupConfig>>();
  dimension$ = new Subject<Dimension>();
  defaultDimension: Dimension = {left: '20px', top: '30px', width: 'calc(100% - 40px)', height: 'calc(100% - 60px)'}

  constructor(private downloader: FileDownloader) {
  }

  update(context: PopupConfig['context']) {
    this.popups$.next({context});
  }

  show(template: TemplateRef<any>, context?: TemplateContext, dimension?: Dimension) {
    this.popups$.next({template, context});
    this.dimension$.next({...this.defaultDimension, ...(dimension || {})});
  }

  openFile(file: BasicFile | File) {
    if ( !file.content ) {
      this.downloader.downloadFile((file as File).id!).subscribe(file => this.openFile(file));
      return;
    }
    
    this.popups$.next({name: 'file', context: this.downloader.createFileContext(file)});
    this.dimension$.next(this.defaultDimension);
    return true;
  }

  openDeletePostDialog(source?: Subject<boolean>) {
    this.popups$.next({name: 'deletePost', output: source});
    this.dimension$.next({width: '100%', height: '200px', top: 'calc(50% - 100px)', left: '0'})
    return new EventEmitter;
  }

  hide() {
    this.popups$.next({template: undefined});
  }
};