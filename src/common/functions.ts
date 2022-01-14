import { Optional } from "./types";

export function nullable<T>(x: T) { return !x; }
export function nonNullable<T>(x: T) { return !!x; }

export function filterMap<U, V>(array: U[], mapping: (x: U) => Optional<V>): V[] {
  return array.map(mapping).filter(nonNullable) as V[];
};

export function filterSplit<U>(array: U[], pred: (x: U) => boolean) {
  let accepted: U[] = [],
    rejected: U[] = [];
  
  array.forEach(x => {
    if ( pred(x) ) accepted.push(x);
    else rejected.push(x);
  }); return [accepted, rejected];
};

export function getByValue<K, V>(map: Map<K, V>, searchValue: V): K | null {
  for (let [key, value] of map.entries()) {
    if (value === searchValue)
      return key;
  }
  return null;
}


export function getDirtyValues(form: any) {
  let dirtyValues: any = {};

  Object.keys(form.controls)
  .forEach(key => {
    let currentControl = form.controls[key];

    if ( currentControl.dirty ) {
      if ( currentControl.controls )
        dirtyValues[key] = getDirtyValues(currentControl);
      else
        dirtyValues[key] = currentControl.value;
    }
  });

  return dirtyValues;
};

const alphanum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export function makeid(length: number) {
  let result = '';
  const charactersLength = alphanum.length;
  for ( let i = 0; i < length; i++ )
    result += alphanum.charAt(Math.floor(Math.random() * charactersLength));
  return result;
};

export function getTopmostElement(element: HTMLElement) {
  while ( element.parentElement && element.parentElement !== document.body)
    element = element.parentElement;
  return element;
}