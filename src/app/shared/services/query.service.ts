import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { DataQueries, DataState } from 'src/models/new/data.state';
import { Notification } from "src/models/new/data.interfaces";
import { ConnectionStatusService } from './connectionStatus.service';
import { LocalService } from './local.service';
import { getTimeStamp } from '../common/functions';
import { tap } from 'rxjs/operators';
import { getUserDataService } from './getUserData.service';

@Injectable({
  providedIn: 'root'
})


export class QueryManager {

  QueryEmitter: EventEmitter<string[]> = new EventEmitter();

  constructor(private store: Store, private connectionService: ConnectionStatusService, private localService: LocalService, private getUserDataService: getUserDataService){}

  emitQueryEvent(params: string[]) {
    this.QueryEmitter.emit(params);
  }

  getQueryEmitter() {
    return this.QueryEmitter;
  }

  query(req: any, name: string, argument: any, existingTimestamp?: string){
    if (this.connectionService.isOnline){
      if (existingTimestamp){
        this.localService.removeData(existingTimestamp)
      }
      return req.pipe(tap((response: any) => {
          console.log(name + ' response', response);
          if (response[argument.action] != "OK") throw response["messages"];
          delete response[argument.action];
  
          this.getUserDataService.emitDataChangeEvent(response.timestamp)
          delete response["timestamp"];
        })
      )}
    else if (existingTimestamp) {
      return null
    }
    else{
      let timestamp = getTimeStamp().toString()
      this.localService.createPendingRequest(timestamp, req, name, argument)
      return null
    }
  }

  backOnline() {
      let keepGoing = true
      let allTimestampValues: string[] = this.localService.getAllTimestampValues()
      while(keepGoing && allTimestampValues) {
        if (this.connectionService.isOnline){
          let params = this.localService.getData(allTimestampValues[0])!.split('/')
          let request = JSON.parse(params[0])
          let argument = params[1]
          let name = params[2]
          this.query(request, name, argument, allTimestampValues[0])
        }
        else{
          keepGoing = false
        }
      }
  }
  }

