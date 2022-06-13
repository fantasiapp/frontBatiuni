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
    // console.log("j'associe (loading)", bool)
    this.isLoading = bool
    // console.log("j'envoie (loading)", this.isLoading)
    this.isLoadingNavChange.emit(this.isLoading);
  }

  getLoadingChangeEmitter() {
    return this.isLoadingNavChange;
  }

  isConnectedNavChange: EventEmitter<boolean> = new EventEmitter();

  isConnected: boolean = false

  emitConnectedChangeEvent(bool : boolean) {
    // console.log("j'associe (connecté)", bool)
    this.isConnected = bool
    // console.log("j'envoie (connecté)", this.isConnected)
    this.isConnectedNavChange.emit(this.isConnected);
  }

  getConnectedChangeEmitter() {
    // console.log("je get et mon état est", this.isConnected)
    return this.isConnectedNavChange;
  }

}

