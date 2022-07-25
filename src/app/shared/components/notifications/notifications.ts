import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from "@angular/core";
import { Select, Store } from "@ngxs/store";
import * as moment from "moment";
import {
  Company,
  Mission,
  Notification,
  Post,
  Candidate,
} from "src/models/new/data.interfaces";
import { FileDownloader } from "../../services/file-downloader.service";
import { DataQueries, DataState } from "src/models/new/data.state";
import { ImageGenerator } from "../../services/image-generator.service";
import { SafeResourceUrl } from "@angular/platform-browser";
import { update } from "src/models/new/state.operators";
import { SingleCache } from "../../services/SingleCache";
import { delay } from "../../common/functions";
import { SwipeupService } from "../swipeup/swipeup.component";
import { Observable } from "rxjs";
import { NotifService } from "../../services/notif.service";

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

  @Select(DataState.view)
  view$!: Observable<'ST' | 'PME'>;

  notificationsDisplay: NotificationDisplay[] = [];

  constructor(
    private store: Store,
    private downloader: FileDownloader,
    private imageGenerator: ImageGenerator,
    private cd: ChangeDetectorRef,
    private notifService: NotifService
  ) {

  }

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

  today: NotificationDisplay[] = [];

  updateToday() {
    let todayDate = new Date(Date.now());
    const todayConst: NotificationDisplay[] = this.notificationsDisplay.filter(
      (notif) => {
      });
    this.today = todayConst.sort((not1:NotificationDisplay, not2:NotificationDisplay) => not1.date < not2.date ? 1 : -1)
    console.log("le today", this.today)

  }

  month: NotificationDisplay[] = [];

  updateMonth() {
    let monthDate = new Date(Date.now());
    const monthConst: NotificationDisplay[] = this.notificationsDisplay.filter(
      (notif) => {
        console.log(moment(moment(monthDate).format("L")), "et", moment(notif.date).format("L"))
        console.log("donc le résultat", moment(moment(monthDate).format("L")).isAfter(moment(notif.date).format("L")))
        return moment(moment(monthDate).format("L")).isAfter(moment(notif.date).format("L"))
      });
    this.month = monthConst.sort((not1:NotificationDisplay, not2:NotificationDisplay) => not1.date < not2.date ? 1 : -1)
    console.log("le month", this.month)
  }

  get timerToday(): any[] {
    let Today = [];
    let max = this.today.length
    let today = this.today;
    moment.locale('fr')
    for (let i = 0; i < max; i++) {
      Today.push(
        moment(moment(today[i].date)).startOf("minute").fromNow()
      );
    }
    moment.locale('en')
    return Today;
  }

  get timerMonth(): any[] {
    let Month = [];
    let max = this.month.length
    let month = this.month
    moment.locale('fr')
    for (let j = 0; j < max; j++) {
      Month.push(
        moment(moment(month[j].date)).startOf("minute").fromNow()
      );
    }
    moment.locale('en')
    return Month;
  }

  ngOnInit() {
    this.view$.subscribe((view) => {
      this.notificationsDisplay = [];
      this.today = []
      this.month = []
      this.notifService.checkNotif()
      this.notifications = this.notifService.notifications
      console.log("les notifs", this.notifications)
      this.lateInit()
    })
    this.lateInit()
  }


  lateInit() {
    this.notifications.forEach((notificationAny, index) => {
      let notification = notificationAny as Notification;
      let src: SafeResourceUrl | string = "assets/profile.png";
      let company: Company | null;
      this.notifications = [];
      switch (notification.nature) {
        case "PME":
          if (notification.missions) {
            let mission = this.store.selectSnapshot(
              DataQueries.getById("Mission", notification.missions)!
            ) as Mission;
            company = mission? (this.store.selectSnapshot(
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
              src = <SafeResourceUrl>SingleCache.getValueByName("companyImage" + company!.id.toString())
            }
            else {
              let logoPME = this.store.selectSnapshot(
              DataQueries.getProfileImage(company.id)
            );
            if (!logoPME) {
              const fullname = company.name[0].toUpperCase();
              src = this.imageGenerator.generate(fullname);
            } else {
              const fullname = company ? company.name[0].toUpperCase() : "A";
              src = this.imageGenerator.generate(fullname);
              this.downloader.downloadFile(logoPME).subscribe((image) => {
              src = this.downloader.toSecureBase64(image);
              SingleCache.setValueByName("companyImage" + company!.id.toString(), src)
              });
            }}
            this.addNotification(notification, index, src);
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
            if (SingleCache.checkValueInCache("companyImage" + company!.id.toString())) {
              src = <SafeResourceUrl>SingleCache.getValueByName("companyImage" + company!.id.toString())
            }
            else {
              let logo = this.store.selectSnapshot(
                DataQueries.getProfileImage(company.id)
              );
            if (!logo) {
                const fullname = company ? company.name[0].toUpperCase() : "A";
                src = this.imageGenerator.generate(fullname);
            } else {
                const fullname = company ? company.name[0].toUpperCase() : "A";
                src = this.imageGenerator.generate(fullname);
              this.downloader.downloadFile(logo).subscribe((image) => {
                src = this.downloader.toSecureBase64(image);
                SingleCache.setValueByName("companyImage" + company!.id.toString(), src)
          });
              }}
              this.addNotification(notification, index, src);
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
    this.updateToday();
    this.updateMonth();
  }

}
