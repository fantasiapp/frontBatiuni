import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactory, ComponentFactoryResolver, ContentChild, Directive, HostBinding, Input, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";

export type Ref = {
  element: any;
  view: any;
};

@Directive()
export abstract class AnimateCSS {
  constructor(protected factoryResolver: ComponentFactoryResolver, protected view: ViewContainerRef) {}

  create(what: any, type: 'template' | 'component', ctx = {}) {
    return type == 'component' ? this.createComponent(what) : this.createTemplate(what, ctx);
  }
  
  protected createTemplate(template: any, ctx = {}): Ref {
    let view = this.view.createEmbeddedView(template, ctx);
    return {element: view.rootNodes[0], view};
  }

  protected createComponent(component: any): Ref {
    let factory = this.factoryResolver.resolveComponentFactory(component),
      componentRef = this.view.createComponent(factory);
    return {element: componentRef.location.nativeElement, view: componentRef.hostView};
  }

  protected animateWithClass(element: HTMLElement, className: string, callback?: Function) {
    if ( ! element || !element.classList ) return;
    element.classList.add(className);
    let save = element.onanimationend;
    element.onanimationend = (e: AnimationEvent) => {
      save && save.call(element, e);
      element.onanimationend = save;
      callback?.(element, e);
      element.classList.remove(className);
    };
  }
};

@Directive({
  selector: '[slide-template]'
})
export class SlideTemplate<T> extends AnimateCSS {
  index: number = 0;
  ref: Ref = {element: null, view: null};

  constructor(protected factoryResolver: ComponentFactoryResolver, protected view: ViewContainerRef, protected cd: ChangeDetectorRef) {
    super(factoryResolver, view);
    (window as any).test = this;
  }
  
  @Input()
  contexts: any[] = [];

  get length() { return this.contexts.length; }


  @Input('slide-template')
  template: TemplateRef<T> | null = null;


  ngOnInit() {
    console.log('init')
    if ( !this.template ) return;
    this.ref = this.createTemplate(this.template, this.contexts[0]);
    this.view.insert(this.ref.view);
  }

  protected slideIn(ref: Ref, direction: 'left' | 'right') {
    if ( !ref.element ) return;
    this.animateWithClass(ref.element, 'slide-in-' + direction);
    //slide in the other direction
    if ( this.ref.element ) {
      this.animateWithClass(this.ref.element, 'slide-out-' + direction, () => {
        this.view.remove(0);
      });
    }
    this.ref = ref;
  }

  slide(direction: 'left' | 'right') {
    let next = direction == 'left' ?
      Math.min(this.contexts.length-1, this.index + 1) : Math.max(0, this.index - 1);
    
     if ( this.index == next ) return;
    this.index = next;
    let ref = this.createTemplate(this.template, this.contexts[this.index]);
    this.view.insert(ref.view);
    this.slideIn(ref, direction);
  }
};