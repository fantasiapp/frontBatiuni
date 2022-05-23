import { EventEmitter, Injectable } from "@angular/core";
import { Store } from "@ngxs/store";
import { Post } from "src/models/new/data.interfaces";
import { Filter } from "../directives/filter.directive";

@Injectable({
  providedIn: "root",
})
export class FilterService {
  navchange: EventEmitter<Post[]> = new EventEmitter();


  constructor(private store: Store) {}
  emitFilterChangeEvent(posts: Post[]) {
    this.navchange.emit(posts);
  }

  getFilterChangeEmitter() {
    return this.navchange;
  }
}
