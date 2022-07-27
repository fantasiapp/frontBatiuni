import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { DataQueries, DataState } from 'src/models/new/data.state';
import { Notification, Post } from "src/models/new/data.interfaces";

@Injectable({
  providedIn: 'root'
})


export class NotifService {
  navchange: EventEmitter<number> = new EventEmitter();

  notificationsUnseen: number = 0
  notificationsMission: Notification[] = []

  token: string = 'y\'a pas de token'
  notifications: Notification[] = [];

  constructor(private store: Store) {}
  emitNotifChangeEvent(num?: number) {
    this.checkNotif()
    if (num !== undefined) {
      this.notificationsUnseen = num
      this.navchange.emit(this.notificationsUnseen);
    }
    else {
      this.navchange.emit(this.notificationsUnseen);
    }
  }
  
  getNotifChangeEmitter() {
    return this.navchange;
  }

  setToken(token: string){
    this.token = token
  }

  getToken(){
    return this.token
  }

  checkNotif() {
    this.notifications = []
    this.notificationsMission = []
    this.notificationsUnseen = 0
    const view = this.store.selectSnapshot(DataState.view)
    let profile = this.store.selectSnapshot(DataQueries.currentProfile)!
    let companyId = profile.user?.company!
    profile.company = this.store.selectSnapshot(DataQueries.getById('Company', companyId))!
    if (profile.company?.Notification) {
      for (const notification of this.store.selectSnapshot(DataQueries.getMany('Notification', profile.company!.Notification)))
        if (view == notification!.role) {
            this.notifications.push(notification!)
          if (!notification!.hasBeenViewed) {
            this.notificationsUnseen++}
          if(notification!.category == "supervision") {
            this.notificationsMission.push(notification!)
          }
        }

    }
  }

  getNotificationUnseenMission(idMission?: number){
    this.checkNotif()
    let notificationsMissionUnseen = []
    if(idMission){
      notificationsMissionUnseen = this.notificationsMission.filter((notif) => !notif.hasBeenViewed && notif.missions == idMission) // !notif.hasBeenViewed && (à rajouter)
    }
    else{
      notificationsMissionUnseen = this.notificationsMission.filter((notif) => !notif.hasBeenViewed && notif.missions) // !notif.hasBeenViewed && (à rajouter)
    }
    return notificationsMissionUnseen.length
  }

  getCandidateUnseen(userOnlinePosts: Post[]){
    let possibleCandidates: number = 0;
    userOnlinePosts.forEach((post: Post) => {
      const candidatesIds = post.candidates || [],
        candidates = this.store.selectSnapshot(DataQueries.getMany("Candidate", candidatesIds));
      candidates.forEach((candidate) => {
        if(candidate.isRefused) candidate.isViewed = true
        if (!candidate.isViewed) possibleCandidates++;
      });
    })
    return possibleCandidates;
  }
}

