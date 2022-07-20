import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { MyStore } from "src/app/shared/common/classes";
import { Select } from "@ngxs/store";
import { Observable } from "rxjs";
import { Profile, File, Company, User } from "src/models/new/data.interfaces";
import { DataQueries, DataState } from "src/models/new/data.state";
import { ChangeProfileType } from "src/models/new/user/user.actions";
import { BooleanService } from "../../services/boolean.service";
import { UIProfileImageComponent } from "../profile-image/profile-image.component";

@Component({
  selector: 'profile-resume',
  templateUrl: './profile-resume.component.html',
  styleUrls: ['./profile-resume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileResume {

  openRatings: boolean = false;
  @Input()
  showRecomandation: boolean = true;
  hasRatings: boolean

  constructor(private store: MyStore, private booleanService: BooleanService, private cd: ChangeDetectorRef) {
    this.hasRatings = booleanService.hasRatings
  }

  @Input()
  profile!: Profile;  

  @Select(DataState.view)
  view$!: Observable<'ST' | 'PME'>;

  @Input()
  showView!: 'ST' | 'PME';

  @Input()
  switch: boolean = true;

  @Input()
  showMore: boolean = false;

  @Input()
  star: boolean = true;

  @Input()
  canChangePicture: boolean = false;

  @Input()
  ratingDetails: boolean = false;

  @Output()
  ratingsClicked = new EventEmitter();

  @Output()
  changePicture = new EventEmitter();

  @ViewChild(UIProfileImageComponent)
  profileImage!: UIProfileImageComponent;

  changeProfileType(type: boolean) {
    this.store.dispatch(new ChangeProfileType(type));
  }

  ngOnInit() {
    this.booleanService.gethasRatingsChangeEmitter().subscribe((bool) => {
      this.hasRatings = bool
      this.cd.markForCheck()
    })
  }

  ngOnChanges() {
    const colorList:{ [key: string]: string } = {"red":"#C95555", "orange":"#FFD375", "lightGreen":"#D2FFCB", "green":"#BBEFB1", "grey":"#aaa"}
    const user = this.profile.user!
    const company = this.profile.company
    const files: (File | null)[] = company.files.map(fileId => this.store.selectSnapshot(DataQueries.getById('File', fileId)))
    const filesName = files.map(file => {
      if (file) {
        return file.name
      }
      return null
    })
  }

};