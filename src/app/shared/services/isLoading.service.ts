import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})


export class isLoadingService {
  navchange: EventEmitter<boolean> = new EventEmitter();

  isLoading: boolean = false

  constructor(private store: Store) {}
  emitLoadingChangeEvent(bool : boolean) {
    this.isLoading = bool
    this.navchange.emit(this.isLoading);
  }

  getLoadingChangeEmitter() {
    return this.navchange;
  }

}

