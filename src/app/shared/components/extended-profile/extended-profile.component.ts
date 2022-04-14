import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { Store } from "@ngxs/store";
import * as UserActions from "src/models/new/user/user.actions";
import { take } from "rxjs/operators";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { DataQueries, QueryProfile, SnapshotArray } from "src/models/new/data.state";
import { Job, File, Profile, JobForCompany} from "src/models/new/data.interfaces";
import { Observable } from "rxjs";
import { Destroy$ } from "src/app/shared/common/classes";
import { getFileColor } from "../../common/functions";


@Component({
  selector: 'extended-profile',
  templateUrl: './extended-profile.component.html',
  styleUrls: ['./extended-profile.component.scss', './desktop.extended.scss'],
  styles: [':host { overflow-y: auto; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtendedProfileComponent extends Destroy$ {

  @SnapshotArray('JobForCompany')
  companyJobs!: JobForCompany[];

  @SnapshotArray('Job')
  jobs!: Job[];

  @SnapshotArray('File')
  files!: File[]; //only responsive to profile changes

  @QueryProfile()
  @Input('profile')
  profile$!: number | Profile | Observable<Profile>;
  
  @Input()
  showContact: boolean = false;

  @Input()
  showSwitch: boolean = true;
  @Input()
  showRecomandation: boolean = true;

  constructor(private store: Store, private popup: PopupService, private cd: ChangeDetectorRef) {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ( changes['profile$'] && !changes['profile$'].isFirstChange() ) {
      (this.profile$ as Observable<Profile>).pipe(take(1)).subscribe(profile => {
        this.files = profile.company.files as any;
        this.companyJobs = profile.company.jobs as any;
        this.jobs = this.companyJobs.map(({job}) => job) as any;
      });
    }
  }

  ngOnInit() {
    (this.profile$ as Observable<Profile>).pipe(take(1)).subscribe(profile => {
      this.files = profile.company.files as any;
      this.companyJobs = profile.company.jobs as any;
      this.jobs = this.companyJobs.map(({job}) => job) as any;
    });
  }

  get attachedFiles(): any[] {
    return this.files.filter(file => file.nature == 'admin' || file.nature == 'labels');
  }

  getFileColor(filename: string) {
    return getFileColor(filename);
  }

  //easier than requestFile, we can have direct access
  openFile(file: File) {
    this.popup.openFile(file);
  }

  @Output()
  ratingsClicked = new EventEmitter();

  @Output()
  profileChanged = new EventEmitter<boolean>();
};