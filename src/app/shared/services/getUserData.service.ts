import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})


export class getUserDataService {
  navchange: EventEmitter<boolean> = new EventEmitter();

  constructor(private store: Store) {}

  emitDataChangeEvent() {
    this.navchange.emit(true);
  }

  getDataChangeEmitter() {
    return this.navchange;
  }
}
