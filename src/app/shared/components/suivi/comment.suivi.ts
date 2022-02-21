import { ChangeDetectionStrategy, Component, ContentChild, Input, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Store } from "@ngxs/store";
import { map, take } from "rxjs/operators";
import { Supervision, File } from "src/models/new/data.interfaces";
import { DownloadFile } from "src/models/new/user/user.actions";
import { SlideTemplate } from "../../directives/slideTemplate.directive";
import { FileDownloader } from "../../services/file-downloader.service";

@Component({
  selector: 'comment-suivi',
  templateUrl: './comment.suivi.html',
  styleUrls: ['./comment.suivi.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuiviComments {
  // We can get the name and the profile image from the state

  @ViewChild(SlideTemplate, {read: SlideTemplate, static: true})
  slides!: SlideTemplate<{src: string}>;

  @ContentChild(SuiviComments, {read: SuiviComments})
  parentComment: SuiviComments | null = null;

  constructor(private downloader: FileDownloader, private sanitizer: DomSanitizer) {
    
  }

  ngOnInit() {
    console.log(this.slides);
  }

  @Input()
  supervision: Supervision = {
    id: -1,
    author: 'Gabriel Dubois', //maybe this should be a UserProfile ?
    date: '13/11/2021',
    comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    files: []
  };

  get manyFiles() { return this.supervision.files.length > 1; }

  slide(k: number) {
    //download fields on the go
  }

  getImage(file?: File) {
    if ( !file ) return null;
    if ( file.content ) return this.downloader.toSecureBase64(file);

    return this.downloader.downloadFile(file).pipe(map(file => this.downloader.toSecureBase64(file)));
  }
}