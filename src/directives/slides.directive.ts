import { ChangeDetectorRef, ComponentFactoryResolver, ComponentRef, Directive, HostBinding, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import { Ref } from "./slideTemplate.directive";

@Directive({
  selector: '[slides]'
})
export class SlidesDirective {
  constructor(private factoryResolver: ComponentFactoryResolver, private view: ViewContainerRef, private cd: ChangeDetectorRef) {}
  
  index: number = 0;
  componentRef: Ref = {element: null, view: null};
  private components: any[] = [];
  private _type: 'component' | 'template' = 'component';

  ngOnInit() {
    let ref = this.componentRef = this.create(0);
    this.view.insert(ref.view);
  }

  @Input('slides')
  set slide(components: any[]) {
    this.components = components;
  };

  @Input('type')
  set type(type: 'component' | 'template') {
    this._type = type;
  };

  private create(index: number) {
    return this._type == 'component' ? this.createComponent(index) : this.createTemplate(index, {});
  }

  private createComponent(index: number) {
    let type = this.components[index % this.components.length],
      factory = this.factoryResolver.resolveComponentFactory(type),
      componentRef = this.view.createComponent(factory);
    
    return {element: componentRef.location.nativeElement, view: componentRef.hostView};
  }

  private createTemplate(index: number, ctx: any) {
    let template: TemplateRef<any> = this.components[index % this.components.length];
    let view = template.createEmbeddedView(ctx);
    return {element: view.rootNodes[0], view};
  };

  private animateWithClass(element: HTMLElement, className: string, callback?: Function) {
    element.classList.add(className);
    let save = element.onanimationend;
    element.onanimationend = (e: AnimationEvent) => {
      save && save.call(element, e);
      element.onanimationend = save;
      callback?.(element, e);
      element.classList.remove(className);
    };
  }

  private slideIn(component: Ref, direction: "left" | "right") {
    if ( !component.element ) return;

    this.animateWithClass(component.element, 'slide-in-' + direction);
    //remove old element
    if ( this.componentRef )
      this.animateWithClass(this.componentRef.element, 'slide-out-' + direction, () => {
        this.view.remove(0);
        this.cd.markForCheck();
      });
  }


  left() {
    let next = Math.min(this.components.length-1, this.index + 1);
    if ( this.index != next ) {
      this.index = next;
      let componentRef = this.create(this.index);
      this.slideIn(componentRef, "left");
      this.componentRef = componentRef;
      this.view.insert(componentRef.view);
      this.cd.markForCheck();
    }
  }

  right() {
    let next = Math.max(0, this.index - 1);
    if ( this.index != next ) {
      this.index = next;
      let componentRef = this.create(this.index);
      this.slideIn(componentRef, "right");
      this.componentRef = componentRef;
      this.view.insert(componentRef.view);
      this.cd.markForCheck();
    }
  }
};


//Think about locking when in animation
//Think how to generate an entire element with structural directives*
//Think about generation from templates