import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, ViewChild } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import * as UserActions from "src/models/user/user.actions";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { UISlideMenuComponent } from "../../../shared/components/slidemenu/slidemenu.component";
import { Logout } from "src/models/auth/auth.actions";
import { InfoService } from "src/app/shared/components/info/info.component";
import { take } from "rxjs/operators";
import { FormGroup } from "@angular/forms";
import { ModifyProfileForm } from "src/app/shared/forms/ModifyProfile.form";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { DataQueries } from "src/models/new/data.state";
import { Destroy$ } from "src/app/shared/common/classes";
import { Profile } from "src/models/new/data.interfaces";


@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent extends Destroy$ {

  @ViewChild(ModifyProfileForm)
  modifyForm?: ModifyProfileForm;

  @ViewChild('modifyMenu', {static: false, read: UISlideMenuComponent})
  modifyMenu!: UISlideMenuComponent;

  //move to state
  openMenu: boolean = false;
  openModifyMenu: boolean = false;
  openRatings: boolean = false;
  modifyPassword: boolean = false;
  openModifyPicture: boolean = false;
  openNotifications : boolean = false;
  
  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  constructor(private store: Store, private cd: ChangeDetectorRef, private info: InfoService, private popup: PopupService) {
    super();
    this.profile$.subscribe(() => {

    });
  }

  slideModifyMenu(modifyPassword: boolean) {
    this.openMenu = false;
    this.openModifyMenu = true;
    this.modifyPassword = modifyPassword;

    if ( !this.modifyPassword ) {
      this.fixScrollTop();
      this.modifyForm?.reload();
    }
  }
  
  private fixScrollTop() {
    this.modifyMenu.resetScroll();
  }

  @HostListener('swipeleft')
  @HostListener('swiperight')
  onSwipe() { 
    this.fixScrollTop();
  }

  swipeModifyPicture() {
    this.openModifyPicture = true;
  }
  
  logout() {
    this.store.dispatch(new Logout()).subscribe(console.log)
  }
  
  modifyProfile(form: any /*FormGroup*/) {
    this.profile$.pipe(take(1)).subscribe(profile => {
      const action = this.store.dispatch(new UserActions.ModifyUserProfile({profile: profile, form}));
      this.info.show("info", "Mise à jour en cours...", Infinity);
      action.pipe(take(1))
        .subscribe(success => {
          this.openModifyMenu = false;
          this.info.show("success", "Profil modifié avec succès", 2000);
          (form as FormGroup).markAsPristine(); (form as FormGroup).markAsUntouched();
          this.cd.markForCheck();
        },
        err => {
          this.info.show("error", "Erreur lors du modification du profil", 5000);
          this.cd.markForCheck();
        });
    });
  }

  changePassword(form: FormGroup) {
    console.log(form, form.value);
    let { oldPwd, newPwd } = form.value;
    let req = this.store.dispatch(new UserActions.ChangePassword(oldPwd, newPwd));
    req.subscribe(
      success => { this.info.show("success", "Mot de passe changé avec succès", 2000); },
      error => { this.info.show("error", "Erreur lors du changement du mot de passe"); }
    )
  }

  async takePhoto() {        
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    this.store.dispatch(new UserActions.ChangeProfilePicture(photo, 'image'));
  }

  async selectPhoto() {
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });


    this.store.dispatch(new UserActions.ChangeProfilePicture(photo, 'image'));
  }
};