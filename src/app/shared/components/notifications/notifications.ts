import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Store } from "@ngxs/store";
import * as moment from "moment";
import { Notification } from "src/models/new/data.interfaces";
import { FileDownloader } from "../../services/file-downloader.service";
import { DataQueries } from "src/models/new/data.state";
import { ImageGenerator } from "../../services/image-generator.service";
import { SafeResourceUrl } from "@angular/platform-browser";

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

  constructor(private store: Store, private downloader: FileDownloader, private imageGenerator: ImageGenerator){
  }

  ngOnInit() {
    this.notifications.forEach((notificationAny, index) => {
      let notification = notificationAny as Notification

      let src: SafeResourceUrl | string = "";
      if ( notification.nature == "Commentaire" || notification.nature == "Horaires"){
        let company = this.store.selectSnapshot(DataQueries.getById('Company', notification.company))!
        let logo = this.store.selectSnapshot(DataQueries.getProfileImage(company.id));
        console.log(logo);
        if (!logo) {
          const fullname = company.name[0].toUpperCase();
          src = this.imageGenerator.generate(fullname);
        } else {
          this.downloader.downloadFile(logo).subscribe(image => {
            src = this.downloader.toSecureBase64(image);
          })
        }
      }
      else if ( notification.nature == "Profil"){
        src = "assets/Icon_!.svg";
      } else {
        src = "assets/Icon_alert.svg";
      }
      
      console.log("Notification")
      console.log(notification)
      console.log(src)
      let notificationDisplay = {
        id: index,
        date: new Date(notification.timestamp * 1000),
        src: src as string,
        text: notification.content
      }
      this.notification.unshift(notificationDisplay)
    })
    let today = new Date(Date.now())
    this.month = this.notification.filter(notif => moment(moment(today).format('L')).isAfter(moment(notif.date).format('L')))
    this.today = this.notification.filter(notif => moment(moment(today).format('L')).isSame(moment(notif.date).format('L')))

    for (let i = 0; i < this.today.length; i++) {
      this.timer.push(moment(moment(this.today[i].date)).startOf('minute').fromNow());
    }
  }
}