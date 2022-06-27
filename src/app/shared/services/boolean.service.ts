import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})


export class BooleanService {
  constructor(private store: Store) {}

  isLoadingNavChange: EventEmitter<boolean> = new EventEmitter();

  isLoading: boolean = false

  emitLoadingChangeEvent(bool : boolean) {
    this.isLoading = bool
    this.isLoadingNavChange.emit(this.isLoading);
  }

  getLoadingChangeEmitter() {
    return this.isLoadingNavChange;
  }

  isConnectedNavChange: EventEmitter<boolean> = new EventEmitter();

  isConnected: boolean = false

  emitConnectedChangeEvent(bool : boolean) {
    this.isConnected = bool
    this.isConnectedNavChange.emit(this.isConnected);
  }

  getConnectedChangeEmitter() {
    return this.isConnectedNavChange;
  }

  hasRatingsNavChange: EventEmitter<boolean> = new EventEmitter();

  hasRatings: boolean = false

  emithasRatingsChangeEvent(bool : boolean) {
    this.hasRatings = bool
    this.hasRatingsNavChange.emit(this.hasRatings);
  }

  gethasRatingsChangeEmitter() {
    return this.hasRatingsNavChange;
  }
}

