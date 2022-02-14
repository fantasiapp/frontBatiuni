import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Sanitizer, SimpleChanges } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Store } from "@ngxs/store";
import { Observable, of } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";
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

  image$!: Observable<File | null>;
  src: SafeResourceUrl | string = '';

  @Input('profile')
  set profile({user, company}: Profile) {
    this.company = company;
    this.image$ = this.store.select(DataQueries.getProfileImage(this.company.id));
    console.log('new profile');

    this.image$.pipe(
      switchMap((file: File | null) => {
        console.log('new image', file);
        if ( !file ) return of(null);
        if ( file.content ) return of(file);
        this.store.dispatch(new DownloadFile(file.id));
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe((file: File | null) => {
      if ( file )
        this.src = this.imageFromFile(file);
      else {
        if ( this.src ) return; //keep current
        const fullname = this.company.name[0].toUpperCase();
        this.src = this.imageGenerator.generate(fullname);
      }

      this.cd.markForCheck();
    });
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