import { EventEmitter, Injectable } from "@angular/core";
import { MyStore } from "src/app/shared/common/classes";
import { Post } from "src/models/new/data.interfaces";
import { Filter } from "../directives/filter.directive";

@Injectable({
  providedIn: "root",
})
export class FilterService {
  navchange: EventEmitter<Post[]> = new EventEmitter();


  constructor(private store: MyStore) {}
  emitFilterChangeEvent(posts: Post[]) {
    this.navchange.emit(posts);
  }

  getFilterChangeEmitter() {
    return this.navchange;
  }
}
