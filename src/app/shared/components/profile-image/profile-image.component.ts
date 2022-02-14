import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Sanitizer, SimpleChanges } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Store } from "@ngxs/store";
import { take } from "rxjs/operators";
import { File, Company, Profile } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";
import { DownloadFile } from "src/models/user/user.actions";
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

  @Input('profile')
  set profile({user, company}: Profile) {
    //when the image changes, so does the profile (new index is added)
    this.company = company;
    this.image = this.store.selectSnapshot(DataQueries.getProfileImage(this.company.id));

    if ( this.image ) {
      if ( this.image.content )
        this.src = this.imageFromFile(this.image);
      else
        this.store.dispatch(new DownloadFile(this.image.id))
          .pipe(take(1))
          .subscribe(() => {
            this.image = this.store.selectSnapshot(DataQueries.getProfileImage(this.company.id));
            this.src = this.imageFromFile(this.image!);
            this.cd.markForCheck();
          });
    } else {
      const fullname = this.company.name[0].toUpperCase();
      this.src = this.imageGenerator.generate(fullname);
    }
  };
  
  private imageFromFile(file: File) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/${file.ext};base64,${file.content}`);
  }

  @Input()
  company!: Company;
  
  constructor(private cd: ChangeDetectorRef, private sanitizer: DomSanitizer, private store: Store, private imageGenerator: ImageGenerator) {
    super();
  }

  static getAvailabilityColor(availability: number) {
    switch(availability) {
      case 0: return '#B9EDAF';
      case 1: return '#FFC425';
      case 2: return '#E80000';
      default: return '#aaaaaa';
    }
  }
};