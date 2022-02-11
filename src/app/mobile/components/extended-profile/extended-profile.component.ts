import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import * as UserActions from "src/models/user/user.actions";
import { InfoService } from "src/app/shared/components/info/info.component";
import { take } from "rxjs/operators";
import { FilesRow, JobForCompany, UserProfileRow } from "src/models/data/data.model";
import { Serialized } from "src/app/shared/common/types";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { SnapshotArray } from "src/models/new/data.state";
import { Job, File, Profile } from "src/models/new/data.interfaces";


@Component({
  selector: 'extended-profile',
  templateUrl: './extended-profile.component.html',
  styleUrls: ['../profile/profile.component.scss'],
  styles: [':host { overflow-y: auto; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtendedProfileComponent {

  @SnapshotArray('JobForCompany')
  companyJobs!: JobForCompany[];

  @SnapshotArray('Job')
  jobs!: Job[];

  @SnapshotArray('File')
  files!: File[];

  _profile!: Profile;
  get profile() { return this._profile; }
  
  @Input()
  set profile(profile: Profile) {
    this._profile = profile;
    this.files = profile.company.files as any;
    this.companyJobs = profile.company.jobs as any;
    this.jobs = this.companyJobs.map(({job}) => job);
  }
  
  @Input()
  showContact: boolean = false;

  constructor(private store: Store, private info: InfoService, private popup: PopupService) {}

  get attachedFiles(): any[] {
    return this.files.filter(file => file.nature == 'admin' || file.nature == 'labels');
  }

  getFileColor(filename: string) {
    return FilesRow.getFileColor(filename);
  }

  //easier than requestFile, we can have direct access
  openFile(file: Serialized<FilesRow>) {
    const target = FilesRow.getById(file.id);
  
    if ( !target ) {
      this.info.show('error', `Le fichier "${file.name}" n'existe pas.`, 2000);
      return;
    }

    if ( target.content ) {
      this.popup.openFile(target);
    } else {
      this.info.show('info', 'Téléchargement du fichier ...', Infinity);

      this.store.dispatch(new UserActions.DownloadFile(target.id)).pipe(take(1))
        .subscribe(() => {
          const file = FilesRow.getById(target.id);
          this.popup.openFile(file);
          this.info.show('success', 'Fichier téléchargé', 1000);
        })
    }
  }

  @Output()
  ratingsClicked = new EventEmitter();

  @Output()
  profileChanged = new EventEmitter<boolean>();
};