import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Store } from "@ngxs/store";
import { map, take } from "rxjs/operators";
import { Supervision, File } from "src/models/new/data.interfaces";
import { DownloadFile } from "src/models/new/user/user.actions";
import { SlideTemplate } from "../../directives/slideTemplate.directive";
import { FileDownloader } from "../../services/file-downloader.service";
import { DataQueries } from "src/models/new/data.state";
import { ImageGenerator } from "../../services/image-generator.service";

@Component({
  selector: "comment-suivi",
  templateUrl: "./comment.suivi.html",
  styleUrls: ["./comment.suivi.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuiviComments {
  // We can get the name and the profile image from the state

  @ContentChild(SuiviComments, { read: SuiviComments })
  parentComment: SuiviComments | null = null;

  reverseComment: boolean = false;
  constructor(
    private cd: ChangeDetectorRef,
    private imageGenerator: ImageGenerator,
    private downloader: FileDownloader,
    private sanitizer: DomSanitizer,
    private store: Store
  ) {}

  ngOnInit() {
    const myUser = this.store.selectSnapshot(DataQueries.currentUser);
    const myName = myUser.firstName + " " + myUser.lastName;

    myName == this.supervision.author && (this.reverseComment = true);
  }

  images: SafeResourceUrl[] = [];
  nbImageSelected: number = 0;
  get imageHasNext(): boolean {
    return this.nbImageSelected + 1 < this.images.length;
  }
  get imageHasPrevious(): boolean {
    return this.nbImageSelected > 0;
  }

  otherImage(change: number) {
    this.nbImageSelected += change;
    this.cd.markForCheck();
  }

  _supervision: Supervision = {
    id: -1,
    Supervisions: [],
    author: "Gabriel Dubois", //maybe this should be a UserProfile ?
    companyId: 1,
    date: "13-11-2021",
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    files: [],
  };
  get supervision() {
    return this._supervision;
  }

  @Input()
  set supervision(supervision: Supervision) {
    this._supervision = supervision;
  }

  modifySupervision() {
    console.log("modifySupervision");
  }

  deleteSupervision() {
    console.log("deleteSupervision");
  }

  ngAfterViewInit(): void {
    for (let file in this.supervision.files) {
      this.downloader
        .downloadFile(this.supervision.files[file])
        .subscribe((image) => {
          this.images.push(this.downloader.toSecureBase64(image));
          this.cd.markForCheck();
        });
    }
  }
}
