import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, EventEmitter, Injectable, Input, Output, TemplateRef, Type, ViewChild, ViewContainerRef } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { UIOpenMenu } from "src/app/shared/common/classes";
import { ContextUpdate, TemplateContext, ViewComponent, ViewMenu, ViewMenuItem, ViewTemplate } from "src/app/shared/common/types";

const TRANSITION_DURATION = 250;

@Component({
  selector: 'swipeup',
  templateUrl: './swipeup.component.html',
  styleUrls: ['./swipeup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UISwipeupComponent extends UIOpenMenu {
  constructor(private cd: ChangeDetectorRef, private componentFactoryResolver: ComponentFactoryResolver, private swipeupService: SwipeupService) {
    super();
  }

  @Input()
  content?: ViewMenu | ViewTemplate | ViewComponent;

  @ViewChild('view', {read: ViewContainerRef, static: false})
  view?: ViewContainerRef;

  @ViewChild('menuTemplate', {read: TemplateRef, static: true})
  menuTemplate!: TemplateRef<any>;

  @Input()
  type: 'list' | 'view' | 'shared' = 'list';

  @Input()
  keepAlive: boolean = true;

  ngOnInit() {
    if ( this.type !== 'shared' ) return;

    this.swipeupService.views$.pipe(takeUntil(this.destroy$)).subscribe(view => {
      if ( !view )
        return this.close();
      
      if ( !this.view ) return; //ignore
      this.view.clear();
      if ( view.type == 'context' ) {
        if ( !this.content || this.content.type != 'template' ) return;
        this.content.context = view.context;
        this.view.createEmbeddedView(this.content.template, this.content.context);
      } else if ( view.type == 'template' ) {
        this.content = view;
        this.view.createEmbeddedView(this.content.template, this.content.context);
      } else if ( view.type == 'component' ) {
        this.content = view;
        const factory = this.componentFactoryResolver.resolveComponentFactory(this.content.component),
          componentRef = this.view.createComponent(factory);
        
        if ( this.content.init )
          this.content.init(componentRef.instance);
      } else {
        this.content = view;
        this.view.createEmbeddedView(this.menuTemplate, {
          $implicit: view.items
        });
      }

      this.open = true;
      this.cd.markForCheck();
    });
  }

  willClose = false;
  close() {
    this.willClose = true;
    setTimeout(() => {
      if ( !this.keepAlive ) this.view?.clear();
      this.willClose = false;
      this._open = false;
      this.openChange.emit(this._open = false); //this saves cd.markForCheck() ??
      this.cd.markForCheck();
    }, TRANSITION_DURATION);
  }

//extends destroy, no multiple inheritance :(
  protected destroy$ = new Subject<void>();
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  onListItemClicked(item: ViewMenuItem) {
    item.click?.();
    if ( (this.content as ViewMenu).hideOnClick ) this.close();
  }
};



@Injectable({
  providedIn: 'root'
})
export class SwipeupService {
  views$ = new Subject<ViewMenu | ViewTemplate | ViewComponent | ContextUpdate | undefined>();

  constructor() {}

  show(view: ViewMenu | ViewTemplate | ViewComponent) {
    this.views$.next(view);
  }

  hide() {
    this.views$.next(undefined);
  }

  updateTemplate(context: ViewTemplate['context']) {
    this.views$.next({type: 'context', context})
  }
};