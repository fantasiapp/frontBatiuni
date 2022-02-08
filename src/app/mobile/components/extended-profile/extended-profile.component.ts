import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { Store } from "@ngxs/store";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";
import * as UserActions from "src/models/user/user.actions";
import { InfoService } from "src/app/shared/components/info/info.component";
import { take } from "rxjs/operators";
import { Company, FilesRow, UserProfileRow } from "src/models/data/data.model";
import { Serialized } from "src/app/shared/common/types";
import { PopupService } from "src/app/shared/components/popup/popup.component";


@Component({
  selector: 'extended-profile',
  templateUrl: './extended-profile.component.html',
  styleUrls: ['../profile/profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExtendedProfileComponent {
  
  user?: User;

  @Input('user')
  set companyFromUser(user: User) {
    this.company = user.profile!.company;
    this.user = user;
  }

  @Input()
  company!: Company;

  constructor(private store: Store, private info: InfoService, private popup: PopupService) {}

  get attachedFiles(): any[] {
    const user = this.store.selectSnapshot(UserState).profile as Serialized<UserProfileRow>;
    return user.company.files.filter(file => file.nature == 'admin' || file.nature == 'labels');
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