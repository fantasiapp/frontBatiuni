import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { DataQueries, DataState } from 'src/models/new/data.state';

@Injectable({
  providedIn: 'root'
})


export class NotifService {
  navchange: EventEmitter<number> = new EventEmitter();

  notificationsUnseen: number = 0

  constructor(private store: Store) {}
  emitNotifChangeEvent(num?: number) {
    if (num !== undefined) {
      this.notificationsUnseen = num
      this.navchange.emit(this.notificationsUnseen);
    }
    else {
      this.checkNotif()
      this.navchange.emit(this.notificationsUnseen);
    }
  }
  getNotifChangeEmitter() {
    return this.navchange;
  }

  checkNotif() {
    const view = this.store.selectSnapshot(DataState.view)
    let profile = this.store.selectSnapshot(DataQueries.currentProfile)!
    let companyId = profile.user?.company!
    profile.company = this.store.selectSnapshot(DataQueries.getById('Company', companyId))!
    if (profile.company?.Notification) {
      for (const notification of this.store.selectSnapshot(DataQueries.getMany('Notification', profile.company!.Notification)))
        if (view == notification!.role) {
          if (!notification!.hasBeenViewed) {
            this.notificationsUnseen++
          }
        }
    }
  }
}
