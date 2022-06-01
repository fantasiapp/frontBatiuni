import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})


export class getUserDataService {
  navchange: EventEmitter<boolean> = new EventEmitter();

  response: any;
  hasNewResponse: boolean = false;

  constructor(private store: Store) {}

  emitDataChangeEvent() {
    if(this.hasNewResponse) {
      this.navchange.emit(this.response);
      this.hasNewResponse = false
    }
  }

  setNewResponse(response: any) {
    this.hasNewResponse = true
    this.response = response
  }

  getDataChangeEmitter() {
    return this.navchange;
  }
}
