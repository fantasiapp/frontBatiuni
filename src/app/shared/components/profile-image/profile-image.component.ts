import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Sanitizer, SimpleChanges } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { File, Company, Profile } from "src/models/new/data.interfaces";
import { DataQueries, QueryProfile } from "src/models/new/data.state";
import { DownloadFile } from "src/models/new/user/user.actions";
import { Destroy$ } from "../../common/classes";
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

  @QueryProfile()
  @Input()
  profile!: number | Observable<Profile> | Profile;

  private imageFromFile(file: File) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/${file.ext};base64,${file.content}`);
  }

  ngOnChanges(changes: SimpleChanges) {
    if ( changes['profile'] ) {
      (this.profile as Observable<Profile>).pipe(take(1)).subscribe(profile => {
        this.image = this.store.selectSnapshot(DataQueries.getProfileImage(profile.company.id));

        if ( this.image ) {
          if ( this.image.content )
            this.src = this.imageFromFile(this.image);
          else
            this.store.dispatch(new DownloadFile(this.image.id))
              .pipe(take(1))
              .subscribe(() => {
                this.image = this.store.selectSnapshot(DataQueries.getProfileImage(profile.company.id));
                this.src = this.imageFromFile(this.image!);
                this.cd.markForCheck();
              });
        } else {
          const fullname = profile.company.name[0].toUpperCase();
          this.src = this.imageGenerator.generate(fullname);
        }
      })
    }
  }
  
  constructor(private cd: ChangeDetectorRef, private sanitizer: DomSanitizer, private store: Store, private imageGenerator: ImageGenerator) {
    super();
  }
};