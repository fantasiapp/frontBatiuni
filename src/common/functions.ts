import { Optional } from "./types";

export function nullable<T>(x: T) { return !x; }
export function nonNullable<T>(x: T) { return !!x; }

export function filterMap<U, V>(array: U[], mapping: (x: U) => Optional<V>) {
  return array.map(mapping).filter(nonNullable);
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
