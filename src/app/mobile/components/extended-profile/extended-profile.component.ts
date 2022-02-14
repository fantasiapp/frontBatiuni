import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { Store } from "@ngxs/store";
import * as UserActions from "src/models/user/user.actions";
import { map, take, takeUntil } from "rxjs/operators";
import { FilesRow, JobForCompany, UserProfileRow } from "src/models/data/data.model";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { DataQueries, DataState, Query, QueryProfile, SnapshotArray } from "src/models/new/data.state";
import { Job, File, Profile, User } from "src/models/new/data.interfaces";
import { Observable } from "rxjs";
import { Destroy$ } from "src/app/shared/common/classes";
import { CastPipe } from "src/app/shared/pipes/cast.pipe";


@Component({
  selector: 'extended-profile',
  templateUrl: './extended-profile.component.html',
  styleUrls: ['../profile/profile.component.scss'],
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
  @Input()
  profile!: number | Profile | Observable<Profile>;

  @Input()
  user: User | null = null;

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes, this.profile);
    if ( changes['profile'] ) {
      //since a profile <=> company, you might want to add user info if you want
      this.profile = this.profile$.pipe(
        map((profile: Profile) => profile.user ? profile : {user: this.user, company: profile.company})
      );

      this.profile$.pipe(takeUntil(this.destroy$)).subscribe(profile => {
        this.files = profile.company.files as any;
        this.companyJobs = profile.company.jobs as any;
        this.jobs = this.companyJobs.map(({job}) => job);
      });
    }
  } 

  get profile$() { return CastPipe.prototype.transform(this.profile); }
  
  @Input()
  showContact: boolean = false;

  constructor(private store: Store, private popup: PopupService) {
    super();
  }

  get attachedFiles(): any[] {
    return this.files.filter(file => file.nature == 'admin' || file.nature == 'labels');
  }

  getFileColor(filename: string) {
    return FilesRow.getFileColor(filename);
  }

  //easier than requestFile, we can have direct access
  openFile(file: File) {
    if ( file.content ) {
      this.popup.openFile(file);
    } else {
      this.store.dispatch(new UserActions.DownloadFile(file.id, true))
        .pipe(take(1)).subscribe(() => {
          
          this.popup.openFile(this.store.selectSnapshot(DataQueries.getById('File', file.id))!);
        });
    }
  }

  @Output()
  ratingsClicked = new EventEmitter();

  @Output()
  profileChanged = new EventEmitter<boolean>();
};