import { TemplateRef, Type } from "@angular/core";

export type Ref = {
  element: any;
  view: any;
};

export type Optional<T> = T | null;

export type CompareFunction<T> = (a: T, b: T) => number;
export type KeysOfType<T, Target> = Exclude<keyof T, {
  [K in keyof T]: T[K] extends Target ? never : K
}[keyof T]>;

export type Slice<T, Key = any, Value = Key extends keyof T ? T[Key] : any> = (item: T) => Value;

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type TemplateContext<T = any> = { $implicit: any } & {[key: string]: any};

export type ViewMenuItem = {
  name: string;
  class?: string;
  click?: Function;
};

export type ViewMenu = {
  readonly type: 'menu';
  items: ViewMenuItem[];
  hideOnClick?: boolean;
  class?: string;
};

export type ViewTemplate = {
  readonly type: 'template';
  template: TemplateRef<any>;
  context?: TemplateContext;
};

export type ViewComponent = {
  readonly type: 'component';
  component: Type<any>;
  init?: Function;
};

export type ContextUpdate = {
  readonly type: 'context';
  context?: TemplateContext;
};