import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Injectable, Input, SimpleChange, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Destroy$, UIOpenMenu } from "src/app/shared/common/classes";

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

  @Input()
  content?: TemplateRef<any>;
  
  @Input()
  params?: any;

  ngOnChanges(changes: SimpleChanges) {
    if ( changes['content'] || changes['params'] )
      this.render();
  }

  private render() {
    this.view.clear();
    if ( this.content ) {
      this.view.createEmbeddedView(this.content, this.params);
      this.open = true;
    } else
      this.open = false;
  }

  ngOnInit() {
    this.popupService.popups$.pipe(takeUntil(this.destroy$)).subscribe((params: Partial<PopupConfig>) => {
      this.params = params.context;
      this.content = params.template;
      this.render();
      this.cd.markForCheck();
    });
  }

  willClose = false;
  close() {
    this.willClose = true;
    setTimeout(() => {
      this.view.clear();
      this.willClose = false;
      this.openChange.emit(this._open = false);
      this.cd.markForCheck();
    }, TRANSITION_DURATION);
  }

  //extends destroy, no multiple inheritance :(
  protected destroy$ = new Subject<void>();
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
};

export type PopupConfig = {
  template: TemplateRef<any>;
  context: {
    $implicit: any;
  } & {[key: string]: any};
};

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  popups$ = new Subject<Partial<PopupConfig>>();

  update(context: PopupConfig['context']) {
    this.popups$.next({context});
  }

  show(template: TemplateRef<any>, context?: PopupConfig['context']) {
    this.popups$.next({template, context});
  }

  hide() {
    this.popups$.next({template: undefined});
  }
};