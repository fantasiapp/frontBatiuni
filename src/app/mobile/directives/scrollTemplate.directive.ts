import { ChangeDetectorRef, ComponentFactoryResolver, Directive, ElementRef, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import { AnimateCSS } from "src/common/classes";

@Directive({
  selector: '[scroll-template]'
})
export class ScrollTemplate<T> extends AnimateCSS {
  constructor(protected factoryResolver: ComponentFactoryResolver, protected view: ViewContainerRef, protected cd: ChangeDetectorRef, protected ref: ElementRef) {
    super(factoryResolver, view);
  }

  indexChanged(k: number): void {
    k > 0 ? this.slide("left", k) : this.slide("right", -k);
  }
  
  @Input()
  contexts: any[] = [];

  @Input()
  direction: 'vertical' | 'horizontal' = 'horizontal';

  get length() { return this.contexts.length; }

  @Input('scroll-template')
  template: TemplateRef<T> | null = null;

  ngOnInit() {
    if ( !this.template ) return;
    //create and insert all templates
    for ( let context of this.contexts ) {
      const ref = this.createTemplate(this.template, context);
      this.view.insert(ref.view);
    }
  }

  slide(direction: 'left' | 'right', dx: number = 1) {
    let next = direction == 'left' ?
      Math.min(this.contexts.length-1, this.index + dx) : Math.max(0, this.index - dx);
    
    if ( this.index == next ) return;
    this._index = next;
    const parent = this.ref.nativeElement.parentElement as HTMLElement,
      parentRect = parent.getBoundingClientRect();
    
    if ( this.direction == 'vertical' ) {
      parent.scrollTo({left: 0, top: this._index * parentRect.height, behavior: 'smooth'})
    } else {
      parent.scrollTo({left: this._index * parentRect.width, top: 0, behavior: 'smooth'});
    }
  }
};


