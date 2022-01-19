import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, ViewChild } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject } from "rxjs";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";
import * as UserActions from "src/models/user/user.actions";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { UISlideMenuComponent } from "../../ui/slidemenu/slidemenu.component";
import { UISwipeupComponent } from "../../ui/swipeup/swipeup.component";
import { Logout } from "src/models/auth/auth.actions";
import { InfoHandler } from "src/app/shared/components/info/info.component";
import { take } from "rxjs/operators";
import { FormGroup } from "@angular/forms";


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
  
  @ViewChild(InfoHandler, {static: true})
  info!: InfoHandler;

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

  constructor(private store: Store, private cd: ChangeDetectorRef) {}

  slideModifyMenu(modifyPassword: boolean) {
    this.openMenu = false;
    this.openModifyMenu = true;
    this.modifyPassword = modifyPassword;
    this.fixScrollTop();
  }

  openModifyPictureMenu() { this.openModifyPicture = true; }
  
  private fixScrollTop() {
    this.modifyMenu.resetScroll();
  }

  @HostListener('swipeleft')
  @HostListener('swiperight')
  onSwipe() { 
    this.fixScrollTop();
  }
  
  logout() {
    this.store.dispatch(new Logout()).subscribe(console.log)
  }
  
  modifyProfile(form: any /*FormGroup*/) {
    const user = this.store.selectSnapshot(UserState);
    const action = this.store.dispatch(new UserActions.ModifyUserProfile({profile: user.profile, form}));
    action.pipe(take(1))
      .subscribe(success => {
        this.openModifyMenu = false;
        this.info.show("success", "Profil modifié avec succès", 2000);
        (form as FormGroup).markAsPristine(); (form as FormGroup).markAsUntouched();
        this.cd.markForCheck();
      },
      err => {
        this.info.show("error", "Erreur lors du modification du profil", 10000);
        this.cd.markForCheck();
      });
  }

  changeProfileType(type: boolean) {
    this.store.dispatch(new UserActions.ChangeProfileType(type));
  };

  async takePhoto() {
    let user = this.store.selectSnapshot(UserState)

    let imageName = user.profile.firstName + '-'+ user.profile.lastName +'-'+ user.profile.id ;
    
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    this.store.dispatch(new UserActions.ChangeProfilePicture(photo, imageName));
  }

  async selectPhoto() {
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });
    let user = this.store.selectSnapshot(UserState)

    let imageName = user.profile.firstName + '_'+ user.profile.lastName +'_'+ user.profile.id ;
    this.store.dispatch(new UserActions.ChangeProfilePicture(photo, imageName));
  }
};