import { ChangeDetectorRef, ComponentFactoryResolver, Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import { AnimateCSS } from "src/common/classes";
import { Ref } from "src/common/types";

@Directive({
  selector: '[slide-template]'
})
export class SlideTemplate<T> extends AnimateCSS {
  ref: Ref = {element: null, view: null};

  constructor(protected factoryResolver: ComponentFactoryResolver, protected view: ViewContainerRef, protected cd: ChangeDetectorRef) {
    super(factoryResolver, view);
  }

  indexChanged(k: number): void {
    k > 0 ? this.slide("left", k) : this.slide("right", -k);
  }
  
  @Input()
  contexts: any[] = [];

  get length() { return this.contexts.length; }

  @Input('slide-template')
  template: TemplateRef<T> | null = null;

  ngOnInit() {
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

  slide(direction: 'left' | 'right', dx: number = 1) {
    let next = direction == 'left' ?
      Math.min(this.contexts.length-1, this.index + dx) : Math.max(0, this.index - dx);
    
     if ( this.index == next ) return;
    this._index = next;
    let ref = this.createTemplate(this.template, this.contexts[this.index]);
    this.view.insert(ref.view);
    this.slideIn(ref, direction);
  }
};