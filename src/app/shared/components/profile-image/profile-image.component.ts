import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, SimpleChanges } from "@angular/core";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { File, User, Company } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";
import { ImageGenerator } from "../../services/image-generator.service";

@Component({
  selector: 'profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIProfileImageComponent {

  image$!: Observable<File | null>;
  src: string = '';

  @Input()
  user!: User;

  @Input('profile')
  set profile({user, company}: {user: User, company: Company}) {
    this.user = user;
    this.company = company;
    this.image$ = this.store.select(DataQueries.getProfileImage(this.company.id));

    this.image$.subscribe(file => {
      console.log(file);
      if ( file ) {
        
      } else {
        const fullname = this.user.firstName[0].toUpperCase() + this.user.lastName[0].toUpperCase();
        this.src = this.imageGenerator.generate(fullname);
      }
    });
  };
  

  @Input()
  company!: Company;
  
  constructor(private cd: ChangeDetectorRef, private store: Store, private imageGenerator: ImageGenerator) {}


  ngOnInit() {
    console.log('on init');

    //this.files$;
  }

  ngOnChanges(changes: SimpleChanges) {
    // const file = this.company ? this.company.files.find(file => file.nature == 'userImage') : null;

    // if ( file ) {
    //   if ( file.content ) this.src = `data:image/${file.ext};base64,${file.content}`;
    //   else {
    //     this.store.dispatch(new DownloadFile(file.id)).pipe(take(1))
    //     .subscribe(() => {
    //       this.src = `data:image/${file.ext};base64,${FilesRow.getById(file.id).content}`;
    //       this.cd.markForCheck();
    //     });
    //   }
    // } else if ( this.user ) {
    //   
    // }
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