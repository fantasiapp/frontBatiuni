import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, Host, HostBinding, Injectable, Input, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ContextUpdate, ViewComponent, ViewMenu, ViewMenuItem, ViewTemplate } from "src/app/shared/common/types";
import { DimensionMenu, UIOpenMenu } from "../../common/classes";

const TRANSITION_DURATION = 250;

//only works with a service
@Component({
  selector: 'tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UITooltipComponent extends DimensionMenu {
  constructor(private cd: ChangeDetectorRef, private componentFactoryResolver: ComponentFactoryResolver, private service: UITooltipService) {
    super();
    this.block = false;
  }

  @Input()
  content?: ViewTemplate | ViewComponent | ViewMenu;

  @Input()
  fromService: boolean = false;

  @ViewChild('view', {read: ViewContainerRef, static: false})
  view?: ViewContainerRef;

  @ViewChild('menuTemplate', {read: TemplateRef, static: true})
  menuTemplate!: TemplateRef<any>;

  @Input()
  keepAlive: boolean = true;

  ngOnInit() {
    if ( !this.fromService ) return;

    this.service.views$.pipe(takeUntil(this.destroy$)).subscribe(view => {
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
          $implicit: view,
          items: view.items
        });
      }

      this.open = true;
      this.cd.markForCheck();
    });

    this.service.dimension$.pipe(takeUntil(this.destroy$)).subscribe(dimension => {
      this.dimension = dimension;
      this.cd.markForCheck();
    })
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

  onListItemClicked(item: ViewMenuItem) {
    item.click?.();
    if ( (this.content as ViewMenu).hideOnClick ) this.close();
  }

  protected destroy$ = new Subject<void>();
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
};

export type TooltipDimension = {
  left: string;
  top: string;
  width?: string;
  height?: string;
};

@Injectable({
  providedIn: 'root'
})
export class UITooltipService {
  dimension$ = new Subject<TooltipDimension>();
  views$ = new Subject<(ViewTemplate | ViewComponent | ViewMenu | ContextUpdate) | undefined>(); 

  show(view: ViewTemplate | ViewComponent | ViewMenu, dimension?: TooltipDimension) {
    this.views$.next(view);
    if ( dimension )
      this.dimension$.next(dimension);
  }

  reshape(dimension: TooltipDimension) {
    this.dimension$.next(dimension);
  }

  hide() {
    this.views$.next(undefined);
  }

  updateTemplate(context: ViewTemplate['context']) {
    this.views$.next({type: 'context', context})
  }
};

//TODO, make content work without service
//All these should inherit from a common class