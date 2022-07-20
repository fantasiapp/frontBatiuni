import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Select } from "@ngxs/store";
import * as UserActions from "src/models/new/user/user.actions";
import { Logout } from "src/models/auth/auth.actions";
import { ImageGenerator } from "src/app/shared/services/image-generator.service";
import { Profile } from "src/models/new/data.interfaces";
import { DataQueries, DataState } from "src/models/new/data.state";
import { Observable } from "rxjs";
import { MyStore } from "src/app/shared/common/classes";
@Component({
  selector: 'desktop-stickyH',
  templateUrl: 'header.desktop.html',
  styleUrls: ['./header.desktop.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderDesktop {
  constructor(private store : MyStore,private imageGenerator: ImageGenerator){

  }

  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  @Select(DataState.view)
  view$!: Observable<'ST' | 'PME'>;

  @Input()
  profile!: Profile;

  @Input()
  navigation: boolean = true;

  changeProfileType(type: boolean) {
    this.store.dispatch(new UserActions.ChangeProfileType(type));
  }
  
  logout() {
    this.store.dispatch(new Logout());
  }
}