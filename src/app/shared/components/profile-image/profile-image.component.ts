import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, SimpleChanges } from "@angular/core";
import { Store } from "@ngxs/store";
import { take } from "rxjs/operators";
import { Company, FilesRow } from "src/models/data/data.model";
import { DownloadFile } from "src/models/user/user.actions";
import { User } from "src/models/user/user.model";
import { ImageGenerator } from "../../services/image-generator.service";
@Component({
  selector: 'profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIProfileImageComponent {

  @Input()
  src: string | null = null;

  user?: User;

  @Input('user')
  set companyFromUser(user: User) {
    this.company = user.profile!.company;
    this.user = user;
  }

  @Input()
  company!: Company;
  
  constructor(private cd: ChangeDetectorRef, private store: Store, private imageGenerator: ImageGenerator) {}

  ngOnInit() {
    console.log('on init')
  }

  ngOnChanges(changes: SimpleChanges) {
    const file = this.company ? this.company.files.find(file => file.nature == 'userImage') : null;
    console.log(changes, file);
    if ( file ) {
      if ( file.content ) this.src = `data:image/${file.ext};base64,${file.content}`;
      else {
        this.store.dispatch(new DownloadFile(file.id)).pipe(take(1))
        .subscribe(() => {
          this.src = `data:image/${file.ext};base64,${FilesRow.getById(file.id).content}`;
          this.cd.markForCheck();
        });
      }
    } else if ( this.user ) {
      const fullname = this.user.profile!.firstName[0].toUpperCase() + this.user.profile!.lastName[0].toUpperCase();
      this.src = this.imageGenerator.generate(fullname);
    }
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