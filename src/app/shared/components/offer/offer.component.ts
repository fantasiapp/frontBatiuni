import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  HostListener,
  Input,
  Output,
} from "@angular/core";
import { SafeResourceUrl } from "@angular/platform-browser";
import { Select, Store } from "@ngxs/store";
import { Observable, Subject } from "rxjs";
import { take } from "rxjs/operators";
import {
  Post,
  Mission,
  Company,
  User,
  Job,
} from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";
import { DeletePost, SetFavorite } from "src/models/new/user/user.actions";
import { FileDownloader } from "../../services/file-downloader.service";
import { ImageGenerator } from "../../services/image-generator.service";
import { NotifService } from "../../services/notif.service";
import { SingleCache } from "../../services/SingleCache";
import { PopupService } from "../popup/popup.component";

@Component({
  selector: "offer",
  templateUrl: "./offer.component.html",
  styleUrls: ["./offer.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferComponent {
  constructor(
    private store: Store,
    private popup: PopupService,
    private cd: ChangeDetectorRef,
    private imageGenerator: ImageGenerator,
    private downloader: FileDownloader,
    private notifService: NotifService
  ) {}

  @Input() view: "ST" | "PME" = "PME";

  @Input() time: number = 8640000000000000;

  @Select(DataQueries.currentUser)
  user$!: Observable<User>;
  favoritePost: boolean = false;


  @Input()
  showCandidate: boolean = false;

  @Input()
  hideExactAdress: boolean = false;

  metier?: Job;

  get unseenCandidate(): number {
    let possibleCandidates: number = 0;
    if (this._post) {
      const candidatesIds = this._post!.candidates || [],
        candidates = this.store.selectSnapshot(
          DataQueries.getMany("Candidate", candidatesIds)
        );
      candidates.forEach((candidate) => {
        if(candidate.isRefused) candidate.isViewed = true
        if (!candidate.isViewed) possibleCandidates++;
      });
    }
    return possibleCandidates;
  }

  @Input()
  src: SafeResourceUrl | string = "";

  @HostListener("press")
  onPress(e: any) {
    if (this.deletable) {
      const subject = new Subject<boolean>();
      subject.pipe(take(1)).subscribe((result) => {
        if (result) this.deletePost();
        this.popup.hide();
      });
      this.popup.openDeletePostDialog(subject);
    }
  }

  @Input()
  deletable: boolean = false;

  company: Company | null = null;
  private _post!: Post | null;
  get post() {
    return this._post;
  }

  get isClosed() {
    let mission = this._post as Mission;
    if (mission && mission.isClosed) return mission.isClosed;
    return false;
  }

  @Input()
  isAppliedPage: boolean = false;

  @Input()
  isMissionPage: boolean = false;

  @Input()
  isRefused: boolean = false;

  notificationsMissionUnseen: number = 0;

  get hasPostulated() {
    const profile = this.store.selectSnapshot(DataQueries.currentProfile);
    let companiesId;
    if (this._post) {
      companiesId = this._post.candidates?.map((id: number) => {
        let candidate = this.store.selectSnapshot(
          DataQueries.getById("Candidate", id)
        );
        
        return candidate!.company;
      });
    }
    return companiesId?.includes(profile.company.id);
  }

  get isViewed() {
    const user = this.store.selectSnapshot(DataQueries.currentUser);
    return user.viewedPosts?.includes(this._post!.id);
  }

  @Input() set post(p: Post | null) {
    this._post = p;
    this.company = p
      ? this.store.selectSnapshot(DataQueries.getById("Company", p.company))
      : null;
  }

  deletePost() {
    this.store.dispatch(new DeletePost(this.post!.id));
  }

  toLocateDate(date?: string) {
    return date ? new Date(date).toLocaleDateString("fr") : "...";
  }

  ngOnInit() {
    this.notifService.getNotifChangeEmitter().subscribe(() => {
      this.notificationsMissionUnseen = this.notifService.getNotificationUnseenMission(this._post!.id)
      this.cd.markForCheck()
    })
    this.notificationsMissionUnseen = this.notifService.getNotificationUnseenMission(this._post!.id)
    if (!this.src) {
      if (SingleCache.checkValueInCache("companyImage" + this.company!.id.toString())) {
        this.src = SingleCache.getValueByName("companyImage" + this.company!.id.toString())
      }
      else {
      let logo = this.store.selectSnapshot(
        DataQueries.getProfileImage(this.company!.id)
      );
      if (!logo) {
      const fullname = this.company!.name[0].toUpperCase();
        this.src = this.imageGenerator.generate(fullname);
          this.cd.markForCheck();
      } else {
              this.downloader.downloadFile(logo).subscribe((image) => {
          this.src = this.downloader.toSecureBase64(image);
          SingleCache.setValueByName("companyImage" + this.company!.id.toString(), this.src)
          this.cd.markForCheck();
        });
      }}
    }

    this.user$.pipe(take(1)).subscribe((usr) => {
      for (const userFavPosts of usr.favoritePosts) {
        if (userFavPosts == this.post?.id) this.favoritePost = true;
      }
    });

    this.metier = this.store.selectSnapshot(DataQueries.getById("Job", this.post!.job)) || undefined;
    this.post!.address = this.hideAdress(this.post!.address)
  }

  toggleFavorite(e: Event) {
    e.stopImmediatePropagation();
    this.favoritePost = !this.favoritePost;

    this.store.dispatch(new SetFavorite(this.favoritePost, this.post!.id));
  }

  hideAdress(adress: string) {
    if (adress && this.hideExactAdress) {
      return adress!.replace(/\d+/, "").trim();
    } else {
      return adress;
    }
  }

}
