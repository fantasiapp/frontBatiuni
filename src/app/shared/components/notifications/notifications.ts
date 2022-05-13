import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from "@angular/core";
import { Store } from "@ngxs/store";
import * as moment from "moment";
import {
  Company,
  Mission,
  Notification,
  Post,
  Candidate,
} from "src/models/new/data.interfaces";
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
}

@Component({
  selector: "notifications",
  templateUrl: "./notifications.page.html",
  styleUrls: ["./notification.page.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Notifications {
  @Input()
  notifications: Notification[] = [];

  notificationsDisplay: NotificationDisplay[] = [];

  constructor(
    private store: Store,
    private downloader: FileDownloader,
    private imageGenerator: ImageGenerator,
    private cd: ChangeDetectorRef
  ) {}

  addNotification(
    notification: Notification,
    index: number,
    src: SafeResourceUrl | string
  ) {
    let notificationDisplay = {
      id: index,
      date: new Date(notification.timestamp * 1000),
      src: (src || "assets/arrow_left.svg") as string,
      text: notification.content,
    };
    this.notificationsDisplay.unshift(notificationDisplay);
  }

  get today(): NotificationDisplay[] {
    let todayDate = new Date(Date.now());
    const today: NotificationDisplay[] = this.notificationsDisplay.filter(
      (notif) =>
        moment(moment(todayDate).format("L")).isSame(
          moment(notif.date).format("L")
        )
    );
    return today.sort((not1:NotificationDisplay, not2:NotificationDisplay) => not1.date < not2.date ? 1 : -1)
  }

  get month(): NotificationDisplay[] {
    let todayDate = new Date(Date.now());
    const month: NotificationDisplay[] = this.notificationsDisplay.filter(
      (notif) =>
        moment(moment(todayDate).format("L")).isAfter(
          moment(notif.date).format("L")
        )
    );
    return month.sort((not1:NotificationDisplay, not2:NotificationDisplay) => not1.date < not2.date ? 1 : -1)
  }

  get timerToday(): any[] {
    let timerToday = [];
    for (let i = 0; i < this.today.length; i++) {
      timerToday.push(
        moment(moment(this.today[i].date)).startOf("minute").fromNow()
      );
    }
    return timerToday;
  }

  get timerMonth(): any[] {
    let timerMonth = [];
    for (let i = 0; i < this.today.length; i++) {
      timerMonth.push(
        moment(moment(this.timerMonth[i].date)).startOf("minute").fromNow()
      );
    }
    return timerMonth;
  }

  ngOnInit() {
    this.notifications.forEach((notificationAny, index) => {
      let notification = notificationAny as Notification;
      let src: SafeResourceUrl | string = "";
      let company: Company | null;
      this.notifications = [];
      switch (notification.nature) {
        case "PME":
          if (notification.missions) {
            let mission = this.store.selectSnapshot(
              DataQueries.getById("Mission", notification.missions)!
            ) as Mission;
            company = mission
              ? (this.store.selectSnapshot(
                  DataQueries.getById("Company", mission.company)
                ) as Company)
              : null;
          } else {
            let post = this.store.selectSnapshot(
              DataQueries.getById("Post", notification.posts)!
            ) as Post;
            company = post
              ? (this.store.selectSnapshot(
                  DataQueries.getById("Company", post.company)
                ) as Company)
              : null;
          }
          if (company) {
            let logoPME = this.store.selectSnapshot(
              DataQueries.getProfileImage(company.id)
            );
            if (!logoPME) {
              const fullname = company.name[0].toUpperCase();
              src = this.imageGenerator.generate(fullname);
              this.addNotification(notification, index, src);
            } else {
              this.downloader.downloadFile(logoPME).subscribe((image) => {
                src = this.downloader.toSecureBase64(image);
                this.addNotification(notification, index, src);
              });
            }
          } else {
            src = "assets/Icon_alert.svg";
            this.addNotification(notification, index, src);
          }
          break;
        case "ST":
          if (notification.missions) {
            let mission = this.store.selectSnapshot(
              DataQueries.getById("Mission", notification.missions)!
            ) as Mission;
            company = mission
              ? (this.store.selectSnapshot(
                  DataQueries.getById("Company", mission.subContractor)
                ) as Company)
              : null;
          } else {
            company = notification.subContractor
              ? (this.store.selectSnapshot(
                  DataQueries.getById("Company", notification.subContractor)!
                ) as Company)
              : null;
          }

          if (company) {
            let logo = this.store.selectSnapshot(
              DataQueries.getProfileImage(company.id)
            );
            if (!logo) {
              const fullname = company ? company.name[0].toUpperCase() : "A";
              src = this.imageGenerator.generate(fullname);
              this.addNotification(notification, index, src);
            } else {
              this.downloader.downloadFile(logo).subscribe((image) => {
                src = this.downloader.toSecureBase64(image);
                this.addNotification(notification, index, src);
              });
            }
          } else {
            src = "assets/Icon_alert.svg";
            this.addNotification(notification, index, src);
          }
          break;
        case "alert":
          src = "assets/Icon_alert.svg";
          this.addNotification(notification, index, src);
          break;
      }
    });
  }
}
