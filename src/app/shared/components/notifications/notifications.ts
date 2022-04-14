import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import * as moment from "moment";
import { Notification } from "src/models/new/data.interfaces";

export interface NotificationDisplay {
  id: number;
  date: Date | string;
  src: string;
  text: string;
};

@Component({
  selector: "notifications",
  templateUrl: "./notifications.page.html",
  styleUrls: ["./notification.page.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Notifications {
  @Input()
  notifications: Notification[] = []

  notification: NotificationDisplay[] = []

  today: any;
  month: any;
  timer: any[] = [];
  ngOnInit() {
    this.notifications.forEach((notificationAny, index) => {
      let notification = notificationAny as Notification
      console.log("notification", index, new Date(notification.timestamp), notification.timestamp * 1000)
      let notificationDisplay = {
        id: index,
        date: new Date(notification.timestamp * 1000),
        src:'assets/PS1B.svg',
        text: notification.content
      }
      this.notification.push(notificationDisplay)
    })
    let today = new Date(Date.now())
    this.month = this.notification.filter(notif => moment(moment(today).format('L')).isAfter(moment(notif.date).format('L')))
    this.today = this.notification.filter(notif => moment(moment(today).format('L')).isSame(moment(notif.date).format('L')))

    for (let i = 0; i < this.today.length; i++) {
        this.timer.push(moment(moment(this.today[i].date)).startOf('hour').fromNow());
    }
  
  }
}