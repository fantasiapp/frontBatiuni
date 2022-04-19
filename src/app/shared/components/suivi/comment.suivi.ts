import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, Input, OnChanges, SimpleChanges, ViewChild, ViewChildren } from "@angular/core";
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuiviComments {

  commentOption: boolean = false;

  toogleCommentOption(){ this.commentOption = !this.commentOption }
  get showCommentOption(){
    return this.commentOption
  }

  deleteComment(){
    console.log('Ce commentaire est supprimé');
  }

  // We can get the name and the profile image from the state

  @ViewChild(SlideTemplate, {read: SlideTemplate, static: false})
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
    date: '13-11-2021',
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

  get manyFiles() { if (this.supervision.files.length > 1){console.log('mayny files')}; return this.supervision.files.length > 1; }


  modifySupervision() {
    console.log("modifySupervision")
  }

  deleteSupervision() {
    console.log("deleteSupervision")
  }

  slide(k: number) {
    //download fields on the go
    console.log("slide", k);
  }

  getImages(){
    var images: SafeResourceUrl[] = [];

    for(let file of this.supervision.files){
      this.downloader.downloadFile(file).subscribe(image => {
        images.push(this.downloader.toSecureBase64(image));
      })
    }
    return images
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("Change:", changes);

    // if ( changes['supervision'] ) {
    //   console.log("change supervision", this.supervision.files);
    //   if ( this.supervision.files[0]){
    //     this.downloader.downloadFile(this.supervision.files[0]).subscribe(image => {
    //       this.src = this.downloader.toSecureBase64(image);
    //       this.cd.markForCheck();
    //       console.log("markForCheck src:", this.src);
    //     })
    //   }
    // }
    console.log("change src:", this.src);
    
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit');
    console.log(this.slides);
    for(let file in this.supervision.files ){
      this.downloader.downloadFile(this.supervision.files[file]).subscribe(image => {
        this.slides.contexts.push(this.downloader.toSecureBase64(image))
      })
    }
    console.log(this.slides);
    // this.slides.changes.subscribe((slides: => SlideTemplate<{src: string}>{


    //   }))
  }

}