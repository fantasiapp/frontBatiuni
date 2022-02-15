import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Injectable, Input, Sanitizer, SimpleChange, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Store } from "@ngxs/store";
import { Subject } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { UIOpenMenu } from "src/app/shared/common/classes";
import { DataQueries } from "src/models/new/data.state";
import { DownloadFile } from "src/models/new/user/user.actions";
import { b64toBlob, getFileType } from "../../common/functions";
import { TemplateContext } from "../../common/types";
import { FileUIOutput } from "../filesUI/files.ui";

const TRANSITION_DURATION = 200;
@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIPopup extends UIOpenMenu {
  constructor(private cd: ChangeDetectorRef, private popupService: PopupService) {
    super();
  }

  @ViewChild('view', {read: ViewContainerRef, static: true})
  view!: ViewContainerRef;

  @ViewChild('file', {read: TemplateRef, static: true})
  file!: TemplateRef<any>;

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

  ngOnInit() {
    if ( !this.fromService ) return;
  
    this.popupService.popups$.pipe(takeUntil(this.destroy$)).subscribe((params: Partial<PopupConfig>) => {
      this.params = params.context;
      console.log(params.context);
      this.content = params.template;
      if ( params.name && !this.content) this.content = this[params.name];
      this.show();
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

export type PopupConfig = {
  name: 'file';
  template: TemplateRef<any>;
  context: TemplateContext;
};

export type FileViewConfig = {
  $implicit: {
    close: Function;
    url: string | null;
    safeUrl: SafeResourceUrl | null,
    type: string,
  }
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  popups$ = new Subject<Partial<PopupConfig>>();

  constructor(private sanitizer: DomSanitizer, private store: Store) {}

  update(context: PopupConfig['context']) {
    this.popups$.next({context});
  }


  show(template: TemplateRef<any>, context?: TemplateContext) {
    this.popups$.next({template, context});
  }

  openFile(file: FileUIOutput) {
    if ( !file.content )
      return this.store.dispatch(new DownloadFile(file.id!, true)).pipe(take(1)).subscribe(() => {
        file = this.store.selectSnapshot(DataQueries.getById('File', file.id!))!;
        file.ext = 'jpeg';
        this.openFile(file);
      });
  
    const type = getFileType(file.ext),
      blob = b64toBlob(Array.isArray(file.content) ? file.content[0] : file.content, type),
      url = URL.createObjectURL(blob),
      context: FileViewConfig = { $implicit: {
        close() { this.url && URL.revokeObjectURL(this.url); },
        url,
        type,
        safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
      }};
    
    this.popups$.next({name: 'file', context});
    return true;
  }

  hide() {
    this.popups$.next({template: undefined});
  }
};