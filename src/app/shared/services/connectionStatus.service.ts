import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { LocalService } from './local.service';

@Injectable({
  providedIn: 'root'
})


export class ConnectionStatusService {
    
  constructor(private store: Store, private localService: LocalService) {
    this.init()
  }

  onlineEvent: Observable<Event> | null = null
  offlineEvent: Observable<Event> | null = null

  subscriptions: Subscription[] = []

  isOnline: boolean = true

  init(): void {
    this.onlineEvent = fromEvent(window, 'online')
    this.offlineEvent = fromEvent(window, 'offline')

    this.subscriptions.push(this.onlineEvent.subscribe(e => {
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

