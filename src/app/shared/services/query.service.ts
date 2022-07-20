import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { DataQueries, DataState } from 'src/models/new/data.state';
import { Notification } from "src/models/new/data.interfaces";
import { ConnectionStatusService } from './connectionStatus.service';
import { LocalService } from './local.service';
import { getTimeStamp } from '../common/functions';

@Injectable({
  providedIn: 'root'
})


export class QueryManager {

  QueryEmitter: EventEmitter<string> = new EventEmitter();

  constructor(private store: Store, private connectionService: ConnectionStatusService, private localService: LocalService){}

  emitQueryEvent(timestamp: string) {
    this.QueryEmitter.emit(timestamp);
  }

  getQueryEmitter() {
    return this.QueryEmitter;
  }

  query(actionOrActions: any ){
    if (this.connectionService.isOnline){
      return this.store.dispatch(actionOrActions)}
    else{
      let timestamp = getTimeStamp()
      this.localService.saveData(timestamp.toString(), JSON.stringify(actionOrActions))
      return null
    }
  }

  backOnline() {
      let keepGoing = true
      let allTimestampValues: string[] = this.localService.getAllTimestampValues();
      allTimestampValues.forEach((value: string) => {
        if (keepGoing){
          if (this.connectionService.isOnline){
              this.store.dispatch(JSON.parse(value))
          }
          else{
            keepGoing = false
          }
        }
      })
  }
  }

