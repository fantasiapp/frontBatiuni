import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
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
  selector: 'comment-suivi',
  templateUrl: './comment.suivi.html',
  styleUrls: ['./comment.suivi.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuiviComments implements OnChanges {
  // We can get the name and the profile image from the state

  @ViewChild(SlideTemplate, {read: SlideTemplate, static: true})
  slides!: SlideTemplate<{src: string}>;

  @ContentChild(SuiviComments, {read: SuiviComments})
  parentComment: SuiviComments | null = null;

  constructor(private cd: ChangeDetectorRef, private imageGenerator: ImageGenerator,private downloader: FileDownloader, private sanitizer: DomSanitizer, private store: Store) {

  }

  src: SafeResourceUrl | string = '';

  _supervision: Supervision = {
    id: -1,
    Supervisions: [],
    author: 'Gabriel Dubois', //maybe this should be a UserProfile ?
    companyId: 1,
    date: 13-11-2021,
    comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    files: []
  };
  get supervision() {
    return this._supervision; }

  @Input()
  set supervision(supervision: Supervision) {
    console.log("supervision input:", supervision);
    this._supervision = supervision;
  }

  get manyFiles() { return this.supervision.files.length > 1; }

  slide(k: number) {
    //download fields on the go
  }


  ngOnChanges(changes: SimpleChanges) {
    console.log("Change:", changes);
    if ( changes['supervision'] ) {
      console.log("change supervision", this.supervision.files);
      if ( this.supervision.files[0]){
        this.downloader.downloadFile(this.supervision.files[0]).subscribe(image => {
          this.src = this.downloader.toSecureBase64(image);
          this.cd.markForCheck();
          console.log("markForCheck src:", this.src);
        })
      }
    }
    console.log("change src:", this.src);
  }

}