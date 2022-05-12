import { Injectable } from "@angular/core";
import { Filter } from "../directives/filter.directive";

@Injectable({
  providedIn: "root",
})
export class FilterService {
  private mapping = new Map<string, Filter<any>>();

  add(name: string, component: Filter<any>) {
    this.mapping.set(name, component);
  }

  remove(name: string) {
    this.mapping.delete(name);
  }

  has(name: string) {
    return this.mapping.has(name);
  }

  filter(
    name: string,
    items: any[],
    providers?: { [key: string]: (t: any) => any }
  ) {
    const filter = this.mapping.get(name);
    if (!filter) {
      console.warn(`Unknown filter ${name}.`);
      return items;
    }

    return filter.filter(items, providers);
  }
}
