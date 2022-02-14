import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SimpleChange, SimpleChanges } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import * as UserActions from "src/models/user/user.actions";
import { InfoService } from "src/app/shared/components/info/info.component";
import { first, take, takeUntil } from "rxjs/operators";
import { FilesRow, JobForCompany, UserProfileRow } from "src/models/data/data.model";
import { Serialized } from "src/app/shared/common/types";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { DataQueries, DataState, Query, QueryProfile, SnapshotArray } from "src/models/new/data.state";
import { Job, File, Profile } from "src/models/new/data.interfaces";
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

  @QueryProfile(true)
  @Input()
  profile!: number | Profile | Observable<Profile>;

  ngOnChanges(changes: SimpleChanges) {
    if ( changes['profile'] ) {
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