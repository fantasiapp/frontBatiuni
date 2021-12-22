import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import * as moment from "moment";

export interface Notification {
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
  notification: Notification[] = [
    {
        id: 1,
        date: new Date(Date.now()),
        src: '/assets/PS1B.svg',
        text: 'Vos horaires pour le chantier Lorem ipsum à été modifier.'
    },
    {
        id: 2,
        date: "2021-12-20T00:00:00Z",
        src: '/assets/PS1B.svg',
        text: 'Vos horaires pour le chantier Lorem ipsum à été modifier. '
    },
    {
        id: 5,
        date: "2021-12-16T11:30:00Z",
        src: '/assets/PS1B.svg',
        text: 'Vos horaires pour le chantier Lorem ipsum à été modifier. '
    },
    {
        id: 3,
        date: "2021-12-15T00:00:00Z",
        src: '/assets/PS1B.svg',
        text: 'Vos horaires pour le chantier Lorem ipsum à été modifier.'
    },
    {
        id: 4,
        date: "2021-12-16T00:00:00Z",
        src: '/assets/PS1B.svg',
        text: 'Vos horaires pour le chantier Lorem ipsum à été modifier.'
    },
  ]

  today: any;
  month: any;
  timer: any[] = [];
  ngOnInit() {
    let today = new Date(Date.now())
    this.month = this.notification.filter(notif => moment(moment(today).format('l')).isAfter(moment(notif.date).format('l')))
    this.today = this.notification.filter(notif => moment(moment(today).format('l')).isSame(moment(notif.date).format('l')))

    for (let i = 0; i < this.today.length; i++) {
        this.timer.push(moment(moment(this.today[i].date)).startOf('hour').fromNow());
    }
    console.log(this.timer)
  }
}