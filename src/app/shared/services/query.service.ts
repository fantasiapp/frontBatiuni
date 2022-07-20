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

  QueryEmitter: EventEmitter<string[]> = new EventEmitter();

  constructor(private store: Store, private connectionService: ConnectionStatusService, private localService: LocalService){}

  emitQueryEvent(params: string[]) {
    this.QueryEmitter.emit(params);
  }

  getQueryEmitter() {
    return this.QueryEmitter;
  }

  query(actionOrActions: any, name: string, existingTimestamp?: string){
    if (this.connectionService.isOnline){
      if (existingTimestamp){
        this.localService.removeData(existingTimestamp)
      }
      return this.store.dispatch(actionOrActions)}
    else if (existingTimestamp) {
      return null
    }
    else{
      let timestamp = getTimeStamp().toString()
      this.localService.saveData(timestamp, this.localService.createKey(actionOrActions, name), true)
      return null
    }
  }

  backOnline() {
      let keepGoing = true
      let allTimestampValues: string[] = this.localService.getAllTimestampValues();
      allTimestampValues.forEach((value: string) => {
        if (keepGoing){
          if (this.connectionService.isOnline){
            let params = this.localService.getData(value)!.split('/')
            let actionOrActions = JSON.parse(params[0])
            let name = params[1]
            this.emitQueryEvent([name, actionOrActions])
          }
          else{
            keepGoing = false
          }
        }
      })
  }
  }

