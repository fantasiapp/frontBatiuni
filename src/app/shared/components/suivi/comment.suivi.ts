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
import { SingleCache } from "../../services/SingleCache";
import * as moment from "moment";

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
  timestamp = {
    date: '',
    hour: ''
  }
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
    console.log(this.supervision.timestamp, 'timestamp');
    moment.locale('fr')
    const timestampMoment = moment(this.supervision.timestamp * 1000)
    this.timestamp.date = timestampMoment.format('DD/MM/YYYY')
    this.timestamp.hour = timestampMoment.format('HH:mm')
    moment.locale('en')
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

  modalImage: SafeResourceUrl = "";
  displayModal: boolean = false;

  _supervision: Supervision = {
    id: -1,
    // Supervisions: [],
    author: "Gabriel Dubois", //maybe this should be a UserProfile ?
    companyId: 1,
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    files: [],
    timestamp: 0
  };
  get supervision() {
    return this._supervision;
  }

  @Input()
  set supervision(supervision: Supervision) {
    this._supervision = supervision;
  }

  modifySupervision() {
  }

  deleteSupervision() {
  }

  ngAfterContentInit(): void {
    this.images = []
    for (let file of this.supervision.files) {
      if (SingleCache.checkValueInCache("supervisionImage" + file.toString())) {
        this.images.push(SingleCache.getValueByName("supervisionImage" + file.toString()))
      }
      else {
        this.downloader.downloadFile(file).subscribe((image) => {
          this.images.push(this.downloader.toSecureBase64(image));
          SingleCache.setValueByName("supervisionImage" + file.toString(), this.downloader.toSecureBase64(image))
          this.cd.markForCheck();
          });
      }
    }
  }

  openModalImage(image: SafeResourceUrl) {
    this.displayModal = true;
    this.modalImage = image;
    this.cd.markForCheck();
  }

  closeModalImage() {
    this.displayModal = false;
    this.modalImage = "";
  }
}
