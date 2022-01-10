import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Store } from "@ngxs/store";
import { UserProfile } from "src/models/data/data.model";
import { UserState } from "src/models/user/user.state";

@Component({
  selector: 'desktop-stickyH',
  templateUrl: 'header.desktop.html',
  styleUrls: ['./header.desktop.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderDesktop {
  constructor(private store : Store){

  }
  ngOnInit(){
    // let userProfile = this.store.selectSnapshot(UserState).profile
  }
}