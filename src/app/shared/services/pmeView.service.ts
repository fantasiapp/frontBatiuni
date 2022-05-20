import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { DataQueries, DataState } from 'src/models/new/data.state';

@Injectable({
  providedIn: 'root'
})


export class PMEView {
  navchange: EventEmitter<number> = new EventEmitter();

  activeView: number = 0

  constructor(private store: Store) {}

  getChangeEmitter() {
    return this.navchange;
  }
}  