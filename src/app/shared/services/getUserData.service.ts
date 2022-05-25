import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})


export class getUserDataService {
  navchange: EventEmitter<boolean> = new EventEmitter();

  constructor(private store: Store) {}

  emitLoadingChangeEvent() {
    this.navchange.emit(true);
  }

  getLoadingChangeEmitter() {
    return this.navchange;
  }
}
