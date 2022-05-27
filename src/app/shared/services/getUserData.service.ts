import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})


export class getUserDataService {
  navchange: EventEmitter<boolean> = new EventEmitter();

  response: any;

  constructor(private store: Store) {}

  emitDataChangeEvent() {
    console.log("yooooo")
    this.navchange.emit(this.response);
  }

  setNewResponse(response: any) {
    this.response = response
  }

  getDataChangeEmitter() {
    return this.navchange;
  }
}
