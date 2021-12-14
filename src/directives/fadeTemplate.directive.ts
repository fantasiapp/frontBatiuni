import { ChangeDetectorRef, ComponentFactoryResolver, Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import { AnimateCSS } from "src/common/classes";
import { Ref } from "src/common/types";

@Directive({
  selector: '[fade-template]'
})
export class FadeTemplate<T> extends AnimateCSS {
  index: number = 0;
  ref: Ref = {element: null, view: null};

  constructor(protected factoryResolver: ComponentFactoryResolver, protected view: ViewContainerRef, protected cd: ChangeDetectorRef) {
    super(factoryResolver, view);
    (window as any).test = this;
  }
  
  @Input()
  contexts: any[] = [];

  get length() { return this.contexts.length; }


  @Input('fade-template')
  template: TemplateRef<T> | null = null;

  ngOnInit() {
    if ( !this.template ) return;
    this.ref = this.createTemplate(this.template, this.contexts[0]);
    this.view.insert(this.ref.view);
  }

  protected fadeIn(ref: Ref) {
    if ( !ref.element ) return;
    this.animateWithClass(ref.element, 'fade-in', () => {
      
    });
    //slide in the other direction
    if ( this.ref.element ) {
      this.animateWithClass(this.ref.element, 'fade-out', () => {
        this.view.remove(0);
      });
    }
    this.ref = ref;
  }

  fadeTo(direction: 'left' | 'right') {
    let next = direction == 'left' ?
      Math.min(this.contexts.length-1, this.index + 1) : Math.max(0, this.index - 1);
    
     if ( this.index == next ) return;
    this.index = next;
    let ref = this.createTemplate(this.template, this.contexts[this.index]);
    this.view.insert(ref.view);
    this.fadeIn(ref);
  }
};