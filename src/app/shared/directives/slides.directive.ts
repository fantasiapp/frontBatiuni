import { ChangeDetectorRef, ComponentFactoryResolver, Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import { IndexBased } from "src/common/classes";
import { Ref } from "src/common/types";

@Directive({
  selector: '[slides]'
})
export class SlidesDirective extends IndexBased {
  constructor(private factoryResolver: ComponentFactoryResolver, private view: ViewContainerRef, private cd: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    let ref = this.componentRef = this.create(0);
    this.view.insert(ref.view);
  }

  componentRef: Ref = {element: null, view: null};
  private components: any[] = [];
  private _type: 'component' | 'template' = 'component';

  @Input('slides')
  set slide(components: any[]) {
    this.components = components;
  };

  @Input('type')
  set type(type: 'component' | 'template') {
    this._type = type;
  };

  @Input('animate')
  animate: boolean = true;

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
    element.classList?.add(className, 'animating');
    let save = element.onanimationend;
    element.onanimationend = (e: AnimationEvent) => {
      save && save.call(element, e);
      element.onanimationend = save;
      callback?.(element, e);
      element.classList.remove(className, 'animating');
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

  indexChanged(k: number, animate = this.animate, done?: Function): void {
    k > 0 ? this.left(k, animate, done) : this.right(-k, animate, done);
  }

  left(k = 1, animate = this.animate, done?: Function) {
    let next = Math.min(this.components.length-1, this.index + k);
    if ( this.index != next ) {
      this._index = next;
      let componentRef = this.create(this.index);
      if ( animate ) this.slideIn(componentRef, "left");
      else this.view.remove(0);
      this.componentRef = componentRef;
      this.view.insert(componentRef.view);
//      this.cd.markForCheck();
      done && done();
    }
  }

  right(k = 1, animate = this.animate, done?: Function) {
    let next = Math.max(0, this.index - k);
    if ( this.index != next ) {
      this._index = next;
      let componentRef = this.create(this.index);
      if ( animate ) this.slideIn(componentRef, "right");
      else this.view.remove(0);
      this.componentRef = componentRef;
      this.view.insert(componentRef.view);
//      this.cd.markForCheck();
      done && done();
    }
  }
};