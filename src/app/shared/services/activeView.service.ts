import { EventEmitter, Injectable } from '@angular/core';
import { MyStore } from "src/app/shared/common/classes";
import { DataQueries, DataState } from 'src/models/new/data.state';
import { Notification } from "src/models/new/data.interfaces";

@Injectable({
  providedIn: 'root'
})


export class ActiveViewService {
  navchange: EventEmitter<number> = new EventEmitter();

    activeView: number = 0;

  constructor(private store: MyStore) {}

  emitActiveViewChangeEvent(num: number) {
    this.activeView = num
    this.navchange.emit(num);
    // this.activeView = 0
  }
  
  getActiveViewChangeEmitter() {
    return this.navchange;
  }

  setActiveView(num: number) {
    this.activeView = num
  }
}

