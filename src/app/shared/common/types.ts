export type Ref = {
  element: any;
  view: any;
};

export type Optional<T> = T | null;

export type NonFunctionPropNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T];

export type Serialized<T> ={
  [P in NonFunctionPropNames<T>]: T[P] extends (string | number | null) ? T[P] : (T[P] extends (infer U)[] ? Serialized<U>[] : Serialized<T[P]>);
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type TemplateContext<T = any> = { $implicit: any} & {[key: string]: any};