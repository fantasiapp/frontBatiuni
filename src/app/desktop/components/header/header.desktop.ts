import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Store } from "@ngxs/store";
import { User } from "src/models/user/user.model";
import * as UserActions from "src/models/user/user.actions";
import { Logout } from "src/models/auth/auth.actions";

@Component({
  selector: 'desktop-stickyH',
  templateUrl: 'header.desktop.html',
  styleUrls: ['./header.desktop.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderDesktop {
  constructor(private store : Store){

  }

  @Input()
  user!: User;

  @Input()
  navigation: boolean = true;

  changeProfileType(type: boolean) {
    this.store.dispatch(new UserActions.ChangeProfileType(type));
  }
  
  logout() {
    this.store.dispatch(new Logout());
  }
}