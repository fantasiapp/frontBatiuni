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
        this.localService.removeData(this.localService.createKey(existingTimestamp, name))
      }
      return this.store.dispatch(actionOrActions)}
    else{
      let timestamp = getTimeStamp().toString()
      this.localService.saveData(this.localService.createKey(timestamp, name), JSON.stringify(actionOrActions))
      return null
    }
  }

  backOnline() {
      let keepGoing = true
      let allTimestampValues: string[] = this.localService.getAllTimestampValues();
      allTimestampValues.forEach((value: string) => {
        let valueSplit = value.split('/')
        let timestamp = valueSplit[0]
        let name = valueSplit[1]
        if (keepGoing){
          if (this.connectionService.isOnline){
            this.emitQueryEvent([name, this.localService.getData(value)!])
          }
          else{
            keepGoing = false
          }
        }
      })
  }
  }

