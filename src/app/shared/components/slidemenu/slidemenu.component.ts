import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, EventEmitter, HostListener, Injectable, Input, Output, ViewChild, ViewContainerRef } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { UIOpenMenu } from "src/app/shared/common/classes";
import { ContextUpdate, ViewComponent, ViewTemplate } from "src/app/shared/common/types";

const TRANSITION_DURATION = 250;

@Component({
  selector: 'slidemenu',
  templateUrl: './slidemenu.component.html',
  styleUrls: ['./slidemenu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UISlideMenuComponent extends UIOpenMenu {
  @ViewChild('content', {static: true})
  contentRef!: ElementRef;

  @Input()
  footer: boolean = false;

  @Input()
  content?: ViewTemplate | ViewComponent;

  @ViewChild('view', {read: ViewContainerRef, static: false})
  view!: ViewContainerRef;

  @Input()
  header: boolean = true;

  @Input()
  fromService: boolean = false;

  @Input()
  keepAlive: boolean = true;

  @Input()
  title: string = '';

  constructor(private cd: ChangeDetectorRef, private componentFactoryResolver: ComponentFactoryResolver, private slideService: SlidemenuService) {
    super();
  }

  ngOnInit() {
    if ( !this.fromService ) return;
    
    this.slideService.views$.pipe(takeUntil(this.destroy$)).subscribe(view => {
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
      }

      this.open = true;
      this.cd.markForCheck();
    });

    this.slideService.title$.pipe(takeUntil(this.destroy$)).subscribe(title => {
      this.title = title;
      this.cd.markForCheck();
    });
  }

  resetScroll() {
    this.contentRef.nativeElement.scrollTop = 0;
  }

  close() {
    this.openChange.emit(this._open = false);
    setTimeout(() => {
      if ( !this.keepAlive ) this.view?.clear();
    }, TRANSITION_DURATION);
  }

  protected destroy$ = new Subject<void>();
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
};

export type Menu = {

};

@Injectable({
  providedIn: 'root'
})
export class SlidemenuService {
  views$ = new Subject<(ViewTemplate | ViewComponent | ContextUpdate) | undefined>(); 
  title$ = new Subject<string>();
  
  show(title: string, view: (ViewTemplate | ViewComponent)) {
    this.title$.next(title);
    this.views$.next(view);
  }

  setTitle(title: string) {
    this.title$.next(title);
  }

  hide() {
    this.views$.next(undefined);
  }

  updateTemplate(context: ViewTemplate['context']) {
    this.views$.next({type: 'context', context})
  }
};