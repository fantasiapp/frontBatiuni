import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { DataQueries, DataState } from 'src/models/new/data.state';
import { Notification } from "src/models/new/data.interfaces";
import { LocalService } from './local.service';
import { getTimeStamp } from '../common/functions';
import { tap } from 'rxjs/operators';
import { getUserDataService } from './getUserData.service';

@Injectable({
  providedIn: 'root'
})


export class QueryManager {

  QueryEmitter: EventEmitter<string[]> = new EventEmitter();

  constructor(private store: Store, private localService: LocalService, private getUserDataService: getUserDataService){
    this.init()
  }

  onlineEvent: Observable<Event> | null = null
  offlineEvent: Observable<Event> | null = null

  subscriptions: Subscription[] = []

  isOnline: boolean = true


  emitQueryEvent(params: string[]) {
    this.QueryEmitter.emit(params);
  }

  getQueryEmitter() {
    return this.QueryEmitter;
  }

  query(req: any, name: string, argument: any, existingTimestamp?: string){
    if (this.isOnline){
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
      if (this.isOnline){
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

  init(): void {
    this.onlineEvent = fromEvent(window, 'online')
    this.offlineEvent = fromEvent(window, 'offline')

    this.subscriptions.push(this.onlineEvent.subscribe(e => {
      if (!this.isOnline){
        this.backOnline()
      }
      this.isOnline = true
      console.log("je suis connecté", this.isOnline)
    }))
    this.subscriptions.push(this.offlineEvent.subscribe(e => {
      this.isOnline = false
      console.log("je ne suis pas connecté", this.isOnline)
      this.localService.dumpLocalStorage()
    }))
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe())
  }

}

