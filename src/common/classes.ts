import { ComponentFactoryResolver, Directive, EventEmitter, HostBinding, Input, Output, ViewContainerRef } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";
import { Subject } from "rxjs";
import { Ref } from "./types";

@Directive()
export class Destroy$ {
  protected destroy$ = new Subject<void>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

export abstract class IndexBased {
  protected _index = 0;
  get index() { return this._index; }
  set index(value: number) {
    if ( this._index == value ) return;
    this.indexChanged(value - this.index);
  };

  abstract indexChanged(k: number): void;
};

@Directive()
export abstract class AnimateCSS extends IndexBased {
  constructor(protected factoryResolver: ComponentFactoryResolver, protected view: ViewContainerRef) {
    super();
  }

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
    if ( element.parentElement )
    element.parentElement.scrollTop = 0;
    element.classList?.add(className, 'animating');    element.classList.add('animating', className);
    
    let save = element.onanimationend;
    element.onanimationend = (e: AnimationEvent) => {
      save && save.call(element, e);
      element.onanimationend = save;
      callback?.(element, e);
      element.classList.remove('animating', className);
    };
  }
};

@Directive()
export abstract class UIOpenMenu {
  @HostBinding('class.open')
  protected _open: boolean = false;

  get open() { return this._open; }
  @Input()
  set open(value: boolean) {
    this._open = value;
    if ( value )
      document.body.classList.add('blocked')
    else
      document.body.classList.remove('blocked');
  }

  @Output()
  openChange = new EventEmitter<boolean>();

  abstract close(): void;
};

@Directive()
export abstract class UIDefaultAccessor<T> implements ControlValueAccessor {
  @Input()
  value: T | undefined;
  
  @Output()
  valueChange = new EventEmitter<T>();

  onChange(e: any) {
    if ( this.disabled ) return;
    let next = this.getInput(e);
    if ( next != this.value ) {
      this.valueChange.emit(this.value = next);
      this.onChanged(this.value);
    }
    this.onTouched();
  };

  protected getInput(e: any): any { return e; };

  disabled: boolean = false;
  setDisabledState(isDisabled: boolean) { this.disabled = isDisabled; }

  onTouched: Function = () => {};
  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  writeValue(value: T) {
    this.valueChange.emit(this.value = value);
  }

  onChanged: Function = (value: boolean) => {};
  registerOnChange(onChanged: any): void {
    this.onChanged = onChanged;
  }
};