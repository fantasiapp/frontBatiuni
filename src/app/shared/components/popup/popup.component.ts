import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Injectable, Input, Sanitizer, SimpleChange, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { UIOpenMenu } from "src/app/shared/common/classes";
import { FilesRow } from "src/models/data/data.model";
import { b64toBlob } from "../../common/functions";
import { Serialized, TemplateContext } from "../../common/types";
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

  constructor(private sanitizer: DomSanitizer) {}

  update(context: PopupConfig['context']) {
    this.popups$.next({context});
  }

  show(template: TemplateRef<any>, context?: TemplateContext) {
    this.popups$.next({template, context});
  }

  openFile(file: FileUIOutput) {
    if ( !file.content ) throw `Unloaded file ${file.nature} ${file.name}. Load before using popup.`;
    const type = FilesRow.getFileType(file.ext),
      blob = b64toBlob(file.content, type),
      url = URL.createObjectURL(blob),
      context: FileViewConfig = { $implicit: {
        close() { this.url && URL.revokeObjectURL(this.url); },
        url,
        type,
        safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
      }};
    
    this.popups$.next({name: 'file', context});
  }

  hide() {
    this.popups$.next({template: undefined});
  }
};