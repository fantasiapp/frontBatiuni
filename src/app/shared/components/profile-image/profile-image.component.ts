import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, Sanitizer, SimpleChanges } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { File, Company, Profile } from "src/models/new/data.interfaces";
import { DataQueries, QueryProfile } from "src/models/new/data.state";
import { DownloadFile } from "src/models/new/user/user.actions";
import { Destroy$ } from "../../common/classes";
import { FileDownloader } from "../../services/file-downloader.service";
import { ImageGenerator } from "../../services/image-generator.service";

@Component({
  selector: 'profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIProfileImageComponent extends Destroy$ {

  image: File | null = null;
  src: SafeResourceUrl | string = '';
  
  colorProfile: string = "conic-gradient(#C95555 11.50%, white 11.50% 13.50%, #FFD375 13.5% 36.5%, white 36.50% 38.50%, #D2FFCB 38.50% 61.5%,white 61.50% 63.5%, #BBEFB1 63.5% 86.5%, white 86.5% 88.5%, #C95555 88.5%);"

  @QueryProfile()
  @Input()
  profile!: number | Observable<Profile> | Profile;

  @Input()
  borders: boolean = true;

  ngOnChanges(changes: SimpleChanges) {
    
    if ( changes['profile'] ) {
      (this.profile as Observable<Profile>).pipe(take(1)).subscribe(profile => {
        this.image = this.store.selectSnapshot(DataQueries.getProfileImage(profile.company.id));
        if ( !this.image ) {
          const fullname = profile.company.name[0].toUpperCase();
          this.src = this.imageGenerator.generate(fullname);
          this.cd.markForCheck();
        } else {
          this.downloader.downloadFile(this.image).subscribe(image => {
            this.src = this.downloader.toSecureBase64(image);
            this.cd.markForCheck();
          });
        }
      });
    }
  }
  
  constructor(private cd: ChangeDetectorRef, private store: Store, private imageGenerator: ImageGenerator, private downloader: FileDownloader) {
    super();
  }

  // computeColor(): string {
  //   let colorList:{ [key: string]: string } = {"red":"#C95555", "orange":"#FFD375", "listGreen":"#BBEFB10", "green":"#BBEFB1", "grey":"#aaa"}
  //   return "background: conic-gradient(var(--my-var) 11.50%, white 11.50% 13.50%, #FFD375 13.5% 36.5%, white 36.50% 38.50%, #D2FFCB 38.50% 61.5%,white 61.50% 63.5%, #BBEFB1 63.5% 86.5%, white 86.5% 88.5%, #C95555 88.5%);"
  //   // return [colorList.grey, colorList.grey, colorList.red, colorList.grey]
  // }

};