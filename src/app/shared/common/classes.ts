import { HttpClient } from "@angular/common/http";
import { Attribute, ChangeDetectorRef, ComponentFactoryResolver, Directive, EventEmitter, HostBinding, HostListener, Injector, Input, Optional, Output, ViewContainerRef } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";
import { Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { Ref } from "./types";

@Directive()
export class Destroy$ {
  protected destroy$ = new Subject<void>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

@Directive()
export abstract class IndexBased {
  protected _index = 0;
  
  @Input()
  get index() { return this._index; }
  set index(value: number) {
    if ( this._index == value ) return;
    this.indexChanged(value - this.index); //will set the index
    this.indexChange.emit(this.index);
  };

  @Output()
  indexChange = new EventEmitter<number>();

  abstract indexChanged(k: number): void;

  get first() { return this._index == 0; };
  abstract get last(): boolean;
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
    if ( element.parentElement ) element.parentElement.scrollTop = 0;
    element.scrollTop = 0;
    element.classList?.add(className);
    
    let save = element.onanimationend;
    element.onanimationend = (e: AnimationEvent) => {
      save && save.call(element, e);
      element.onanimationend = save;
      callback?.(element, e);
      element.classList.remove(className);
    };
  }
};

@Directive()
export abstract class UIOpenMenu {
  protected initialized: boolean = false;

  @HostBinding('class.open')
  protected _open: boolean = false;
  
  @Input() block: boolean = true;

  get open() { return this._open; }
  @Input()
  set open(value: boolean) {
    if ( !this.initialized ) {
      this.initialized = true;
      this._open = value;
      return;
    }

    if ( value == this._open ) return;
    
    if ( value ) {
      if ( this.block ) document.body.classList.add('blocked');
      this._open = value;
    }
    else {
      if ( this.block ) document.body.classList.remove('blocked');
      //this._open = false;
      this.close()
    }
  }

  @Output()
  openChange = new EventEmitter<boolean>();

  abstract close(): void;
};

export type Dimension = {
  left: string;
  top: string;
  width?: string;
  height?: string;
};

@Directive()
export abstract class DimensionMenu extends UIOpenMenu {
  constructor() {
    super();
  }

  @Input()
  dimension: Dimension = {left: '0', top: '0'};

  @HostBinding('style.left')
  get dimensionX() { return this.dimension.left; }

  @HostBinding('style.top')
  get dimensionY() { return this.dimension.top; }

  @HostBinding('style.width')
  get width() { return this.dimension.width || '100%'; }

  @HostBinding('style.height')
  get height() { return this.dimension.height || '100%'; }
};

//Very important class, should be fine for now
//valueChange is trigged whenever the value changes
//there should be another event for stuff that come from the DOM
//because now we have to rely on other events like (click) etc to get user action
//this won't cause issue but it will feel like dodging bullets once to start doing
//something unorthodox
@Directive()
export abstract class UIDefaultAccessor<T> implements ControlValueAccessor {
  protected _value: T | undefined;

  get value(): T | undefined {
    return this._value;
  }

  @Input()
  set value(value: T | undefined) {
    this.set(value!);
  }
  
  @Output()
  valueChange = new EventEmitter<T>();

  constructor(protected cd: ChangeDetectorRef) {}

  @HostBinding('attr.tabindex')
  get tabIndex() { return 0; }

  @HostListener('blur')
  private $onTouched() { this.onTouched(); }

  set(next: T, notifyForm: boolean = true) {
    if ( next !== this.value ) {
      this.valueChange.emit(this._value = next);
      if ( notifyForm ) this.onChanged(this.value);
      this.cd.markForCheck();
    }
    //apparently skipping this call breaks everything
    this.$onTouched();
  }

  onChange(e: any): any {
    if ( this.isDisabled ) { e.preventDefault?.(); return; }
    this.set(this.getInput(e) as T);
    return this.value;
  };

  //default implementation
  protected getInput(e: any): T | Promise<T> { return e; };

  @Input()
  set disabled(disabled: any) {
    if ( disabled != null ) this.isDisabled = true;
    else this.isDisabled = false;
  }


  isDisabled: boolean = false;
  setDisabledState(isDisabled: boolean) { this.isDisabled = isDisabled; }

  onTouched: Function = () => {};
  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  writeValue(value: T) {
    if ( value === void 0 ) return;
    this.set(value, false);
  }

  onChanged: Function = (value: boolean) => {};
  registerOnChange(onChanged: any): void {
    this.onChanged = onChanged;
  }
};

@Directive()
export class UIAsyncAccessor<T> extends UIDefaultAccessor<T> {
  constructor(cd: ChangeDetectorRef) {
    super(cd);
  }

  protected getInput(e: any): Promise<T> { return super.getInput(e) as Promise<T>; }

  async onChange(e: any) {
    if ( this.isDisabled ) { e.preventDefault?.(); return; }
    let next = await this.getInput(e);
    this.set(next);
  };
};


//make it compatible with references ??
export const PropertyTrap: ProxyHandler<any> = {
  get(target: any, property: string) {
    const path = property.split('.');
    
    let root = target;
    for ( const field of path ) {
      if ( root[field] ) root = root[field];
      else return undefined;
    };
    return root;
  },

  set(target, property: string, value: any) {
    const path = property.split('.'),
      lastField = path[path.length - 1];
    
    let root = target;
    for ( const field of path.slice(0, -1) ) {
      if ( root[field] ) root = root[field];
      else root = root[field] = {};
    }
    root[lastField] = value;
    return true;
  }
};