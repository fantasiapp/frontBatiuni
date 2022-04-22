import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { Store } from "@ngxs/store";
import * as moment from "moment";
import { Company, Mission, Notification, Post, Candidate } from "src/models/new/data.interfaces";
import { FileDownloader } from "../../services/file-downloader.service";
import { DataQueries } from "src/models/new/data.state";
import { ImageGenerator } from "../../services/image-generator.service";
import { SafeResourceUrl } from "@angular/platform-browser";
import { update } from "src/models/new/state.operators";

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

  constructor(private store: Store, private downloader: FileDownloader, private imageGenerator: ImageGenerator, private cd: ChangeDetectorRef){
  }

  addNotification(notification: Notification, index: number, src: SafeResourceUrl | string){
    let notificationDisplay = {
      id: index,
      date: new Date(notification.timestamp * 1000),
      src: (src || "assets/arrow_left.svg") as string,
      text: notification.content
    }
    this.notification.unshift(notificationDisplay)
    this.updateNotifications();
  }

  updateNotifications(){
    let today = new Date(Date.now())
    this.month = this.notification.filter(notif => moment(moment(today).format('L')).isAfter(moment(notif.date).format('L')))
    this.today = this.notification.filter(notif => moment(moment(today).format('L')).isSame(moment(notif.date).format('L')))

    for (let i = 0; i < this.today.length; i++) {
      this.timer.push(moment(moment(this.today[i].date)).startOf('minute').fromNow());
    }
  }

  ngOnInit() {
    this.notifications.forEach((notificationAny, index) => {
      let notification = notificationAny as Notification
      console.log("Notification", notification)
      let src: SafeResourceUrl | string = ""
      let company: Company
      switch ( notification.nature ){
        case "PME":
          if (notification.missions) {
            let mission = this.store.selectSnapshot(DataQueries.getById("Mission", notification.missions)!) as Mission;
            company = this.store.selectSnapshot(DataQueries.getById("Company", mission.company)) as Company;
            console.log("init notification", company)
          } else {
            let post = this.store.selectSnapshot(DataQueries.getById("Post", notification.posts)!) as Post;
            company = this.store.selectSnapshot(DataQueries.getById("Company", post.company)) as Company;
          }
          let logoPME = this.store.selectSnapshot(DataQueries.getProfileImage(company.id))
          if (!logoPME) {
            const fullname = company.name[0].toUpperCase();
            src = this.imageGenerator.generate(fullname);
            this.addNotification(notification, index, src);
          } else {
            this.downloader.downloadFile(logoPME).subscribe(image => {
              src = this.downloader.toSecureBase64(image);
              this.addNotification(notification, index, src);
            })
          }
          break
        case "ST":
          if (notification.missions) {
            let mission = this.store.selectSnapshot(DataQueries.getById("Mission", notification.missions)!) as Mission;
            let candidates = this.store.selectSnapshot(DataQueries.getAll("Candidate")!) as Candidate[];
            console.log("ST", candidates)
            company = this.store.selectSnapshot(DataQueries.getById("Company", mission.subContractor)) as Company;
          } else {
            let post = this.store.selectSnapshot(DataQueries.getById("Post", notification.posts)!) as Post;
            company = this.store.selectSnapshot(DataQueries.getById("Company", post.company)) as Company;
          }

          let logo = this.store.selectSnapshot(DataQueries.getProfileImage(company.id));
          if (!logo) {
            const fullname = company.name[0].toUpperCase();
            src = this.imageGenerator.generate(fullname);
            this.addNotification(notification, index, src);
          } else {
            this.downloader.downloadFile(logo).subscribe(image => {
              src = this.downloader.toSecureBase64(image);
              this.addNotification(notification, index, src);
            })
          }
          break;
        case "alert":
          src = "assets/Icon_alert.svg"
          this.addNotification(notification, index, src);
          break;
      }
    })

    this.updateNotifications();
  }


}