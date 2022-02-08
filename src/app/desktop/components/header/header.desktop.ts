import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Store } from "@ngxs/store";
import { User } from "src/models/user/user.model";
import * as UserActions from "src/models/user/user.actions";
import { Logout } from "src/models/auth/auth.actions";
import { ImageGenerator } from "src/app/shared/services/image-generator.service";
@Component({
  selector: 'desktop-stickyH',
  templateUrl: 'header.desktop.html',
  styleUrls: ['./header.desktop.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderDesktop {
  constructor(private store : Store,private imageGenerator: ImageGenerator){

  }

  @Input()
  user!: User;

  @Input()
  navigation: boolean = true;

  src!:string;

  ngOnInit() {
    const fullname = this.user.profile!.firstName[0].toUpperCase() + this.user.profile!.lastName[0].toUpperCase();
    this.src = this.src = this.user.imageUrl || this.imageGenerator.generate(fullname);
  }

  changeProfileType(type: boolean) {
    this.store.dispatch(new UserActions.ChangeProfileType(type));
  }
  
  logout() {
    this.store.dispatch(new Logout());
  }
}