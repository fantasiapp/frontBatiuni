export type Ref = {
  element: any;
  view: any;
};

export type Optional<T> = T | null;
export type Table<Model> = {
  serialize(): Model;
};


export type getTableModel<T> = T extends Table<infer U> ? U : any;

export type NonFunctionPropNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T];

export type Serialized<T> ={
  [P in NonFunctionPropNames<T>]: T[P] extends (string | number) ? T[P] : (T[P] extends (infer U)[] ? Serialized<U>[] : Serialized<T[P]>);
};