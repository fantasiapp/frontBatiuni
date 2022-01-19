import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Select } from "@ngxs/store";
import { BehaviorSubject } from "rxjs";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";

@Component({
  selector: 'profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePageComponent {
  abonnementTabs: boolean = false;
  activeView: number = 0;
  tabView: number = 0;
  factures = new Array(10).fill(0);

  setView(view: number) { this.activeView = view; }
  
  @Select(UserState)
  user$!: BehaviorSubject<User>;
}