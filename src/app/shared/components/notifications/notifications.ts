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
import { SingleCache } from "../../services/SingleCache";
import { delay } from "../../common/functions";

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
    const todayConst: NotificationDisplay[] = this.notificationsDisplay.filter(
      (notif) =>
        moment(moment(todayDate).format("L")).isSame(
          moment(notif.date).format("L")
        )

    );
    return todayConst.sort((not1:NotificationDisplay, not2:NotificationDisplay) => not1.date < not2.date ? 1 : -1)
  }

  get month(): NotificationDisplay[] {
    let monthDate = new Date(Date.now());
    const monthConst: NotificationDisplay[] = this.notificationsDisplay.filter(
      (notif) =>
        moment(moment(monthDate).format("L")).isAfter(
          moment(notif.date).format("L")
        )
    );
    return monthConst.sort((not1:NotificationDisplay, not2:NotificationDisplay) => not1.date < not2.date ? 1 : -1)
  }

  get timerToday(): any[] {
    let Today = [];
    let max = this.today.length
    for (let i = 0; i < max; i++) {
      Today.push(
        moment(moment(this.today[i].date)).startOf("minute").fromNow()
      );
    }
    return Today;
  }

  get timerMonth(): any[] {
    let Month = [];
    let max = this.month.length
    for (let j = 0; j < max; j++) {
      Month.push(
        moment(moment(this.month[j].date)).startOf("minute").fromNow()
      );
    }
    return Month;
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
            if (SingleCache.checkValueInCache("companyImage" + company!.id.toString())) {
              src = SingleCache.getValueByName("companyImage" + company!.id.toString())
            }
            else {
            let logoPME = this.store.selectSnapshot(
              DataQueries.getProfileImage(company.id)
            );
            if (!logoPME) {
              const fullname = company.name[0].toUpperCase();
              src = this.imageGenerator.generate(fullname);
          SingleCache.setValueByName("companyImage" + company!.id.toString(), src)
          this.addNotification(notification, index, src);
            } else {
              this.downloader.downloadFile(logoPME).subscribe((image) => {
                src = this.downloader.toSecureBase64(image);
          SingleCache.setValueByName("companyImage" + company!.id.toString(), src)
          this.addNotification(notification, index, src);
              });
            }}
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
