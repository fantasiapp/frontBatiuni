import { ChangeDetectionStrategy, Component, HostListener, ViewChild } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject } from "rxjs";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";
import * as UserActions from "src/models/user/user.actions";
import { Option } from "src/models/option";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { UISlideMenuComponent } from "../../ui/slidemenu/slidemenu.component";
import { UISwipeupComponent } from "../../ui/swipeup/swipeup.component";
import { Logout } from "src/models/auth/auth.actions";
import { ImageGenerator } from "src/app/shared/services/image-generator.service";
import { map, take } from "rxjs/operators";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { Email } from "src/validators/persist";
import { Job, UserProfile } from "src/models/data/data.model";


@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  @ViewChild(UISwipeupComponent, {static: false})
  swipeMenu!: UISwipeupComponent;

  @ViewChild(UISlideMenuComponent, {static: false})
  slideMenu!: UISlideMenuComponent;

  @ViewChild('modifyMenu', {static: false, read: UISlideMenuComponent})
  modifyMenu!: UISlideMenuComponent;

  @Select(UserState)
  user$!: BehaviorSubject<User>;

  //move to state
  openMenu: boolean = false;
  openModifyMenu: boolean = false;
  openRatings: boolean = false;
  modifyPassword: boolean = false;
  openModifyPicture: boolean = false;
  openNotifications : boolean = false;

  constructor(private store: Store) {}

  async ngOnInit() {
    let permissions  = await Camera.checkPermissions();
    if ( permissions.camera != 'granted' || permissions.photos != 'granted' )
      try {
        await Camera.requestPermissions({
          permissions: ["camera", "photos"]
        });
      } catch ( e ) {  }
  }

  slideModifyMenu(modifyPassword: boolean) {
    this.openMenu = false;
    this.openModifyMenu = true;
    this.modifyPassword = modifyPassword;
  }

  openModifyPictureMenu() {
    this.openModifyPicture = true;
  }
  
  private fixScrollTop() {
    this.modifyMenu.resetScroll();
  }

  @HostListener('swipeleft')
  onSwipeLeft() { 
    this.fixScrollTop();
  }
  
  @HostListener('swiperight')
  onSwipeRight() {
    this.fixScrollTop();
  }

  logout() {
    this.store.dispatch(new Logout()).subscribe(console.log)
  }
  
  modifyProfile(form: any /*FormGroup*/) {
    this.store.dispatch(new UserActions.ModifyUserProfile(form));
  }

  changeProfileType(type: boolean) {
    this.store.dispatch(new UserActions.ChangeProfileType(type));
  };

  async takePhoto() {
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    let imageName = '';
    let user = this.user$.subscribe(user => {
      imageName = user.profile?.firstName + '-' + user.profile?.lastName + '-' + user.profile?.id;
    })
    this.store.dispatch(new UserActions.ChangeProfilePicture(photo,imageName));
  }

  async selectPhoto() {
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });
    let format = photo.format
    let imageName = '';
    let user = this.user$.subscribe(user=> {
      imageName = user.profile?.firstName + '-' + user.profile?.lastName + '-' + user.profile?.id;
    })
    this.store.dispatch(new UserActions.ChangeProfilePicture(photo,imageName));
    // this.store.dispatch(new UserActions.ChangeProfilePicture('data:image/png;base64,' + photo.base64String!,imageName));
  }

  onSubmit() {}
};