import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { DataQueries, DataState } from 'src/models/new/data.state';
import { Notification } from "src/models/new/data.interfaces";
import { LocalService } from './local.service';
import { getTimeStamp } from '../common/functions';
import { tap } from 'rxjs/operators';
import { HttpService, API } from "src/app/services/http.service";
import { getUserDataService } from './getUserData.service';

@Injectable({
  providedIn: 'root'
})


export class QueryManager {

  QueryEmitter: EventEmitter<string[]> = new EventEmitter();

  constructor(private store: Store, private localService: LocalService, private getUserDataService: getUserDataService, private http: HttpService){
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

  query(format: string, api: API, name: string, argument: any, existingTimestamp?: string){
    if (this.isOnline){
      if (existingTimestamp){
        this.localService.removeData(existingTimestamp)
      }
      console.log("la requête et les params en général", format, name, argument)
      let req: any
      if (format == "get") {let req = this.http.get(api, argument)}
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
      this.localService.createPendingRequest(timestamp, format,api, name, argument)
      return null
    }
  }

  backOnline() {
    let keepGoing = true
    let allTimestampValues: string[] = this.localService.getAllTimestampValues()
    while(keepGoing && allTimestampValues) {
      if (this.isOnline){
        console.log("je suis dedans", allTimestampValues)
        let params = this.localService.getData(allTimestampValues[0])!.split('/')
        let format = params[0]
        let api: API = <API> params[1]
        let argument = JSON.parse(params[2])
        let name = params[2]
        this.query(format, api, name, argument, allTimestampValues[0])
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
        this.isOnline = true
        console.log("je lance backOnline")
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

