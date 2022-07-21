import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, EventEmitter, HostListener, Injectable, Input, Output, ViewChild, ViewContainerRef } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { UIOpenMenu } from "src/app/shared/common/classes";
import { ContextUpdate, ViewComponent, ViewTemplate } from "src/app/shared/common/types";
import { InfoService } from "../info/info.component";

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
  content?: Exclude<SlidemenuView, ContextUpdate>;

  @ViewChild('view', {read: ViewContainerRef, static: false})
  view!: ViewContainerRef;

  @Input()
  header: boolean = true;

  @Input()
  set footer(f: 'none' | 'small' | 'medium' | 'big') {
    this.ngClass = {
      'header-only': f == 'none',
      'content-with-small-footer': f == 'small',
      'content-with-mid-footer': f == 'medium',
      'content-with-big-footer': f == 'big'
    }
  };

  ngClass: any = {'header-only': true};

  @Input()
  fromService: boolean = false;

  @Input()
  keepAlive: boolean = true;

  @Input()
  title: string = '';

  constructor(
    private cd: ChangeDetectorRef, private componentFactoryResolver: ComponentFactoryResolver,
    private slideService: SlidemenuService, private info: InfoService) {
    super();
  }

  set open(value: boolean) {

    if ( this.initialized ) {
      if ( value ) {
        this.info.enableBothOverlay(false)
        this.info.alignWith('header');
      }
      else {
        this.info.enableBothOverlay(null)
        this.info.alignWith('last');
      }
    }
    
    super.open = value;    
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

    this.info.hide()
    setTimeout(() => {
      if ( !this.keepAlive ) this.view?.clear();
      if( this.content?.close ) this.content.close();
    }, TRANSITION_DURATION);
  }

  protected destroy$ = new Subject<void>();
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
};

export type SlidemenuView = (ViewTemplate | ViewComponent | ContextUpdate) & {
  close?: Function;
}; 

@Injectable({
  providedIn: 'root'
})
export class SlidemenuService {
  views$ = new Subject<SlidemenuView>(); 
  title$ = new Subject<string>();
  
  show(title: string, view: SlidemenuView) {
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