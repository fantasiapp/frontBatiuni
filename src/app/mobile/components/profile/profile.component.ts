import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, ViewChild } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable, Subscriber } from "rxjs";
import * as UserActions from "src/models/new/user/user.actions";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { UISlideMenuComponent } from "../../../shared/components/slidemenu/slidemenu.component";
import { Logout } from "src/models/auth/auth.actions";
import { InfoService } from "src/app/shared/components/info/info.component";
import { take } from "rxjs/operators";
import { FormGroup } from "@angular/forms";
import { ModifyProfileForm } from "src/app/shared/forms/ModifyProfile.form";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { DataQueries, DataState } from "src/models/new/data.state";
import { Destroy$ } from "src/app/shared/common/classes";
import { Profile } from "src/models/new/data.interfaces";
import { Notification } from "src/models/new/data.interfaces";
import { NotificationViewed } from "src/models/new/user/user.actions";
import { AppComponent } from "src/app/app.component";
import { NotifService } from "src/app/shared/services/notif.service";
import { getUserDataService } from "src/app/shared/services/getUserData.service";
import { ProfileResume } from "src/app/shared/components/profile-resume/profile-resume.component";


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

  @ViewChild(ProfileResume)
  profileResume?: ProfileResume

  //move to state
  openMenu: boolean = false;
  openModifyMenu: boolean = false;
  openApplications: boolean = false;
  openInviteFriendMenu: boolean = false;
  modifyPassword: boolean = false;
  openModifyPicture: boolean = false;
  _openNotifications : boolean = false;
  notificationsUnseen: number = 0
  notifications: Notification[] = []
  companyId:number = -1

  profile = this.store.selectSnapshot(DataQueries.currentProfile);

  view = this.store.selectSnapshot(DataState.view)

  get openNotifications() {
    return this._openNotifications}


  set openNotifications(b: boolean) {

    if (b) {
      this.store.dispatch(new NotificationViewed(this.companyId, this.view)).pipe(take(1)).subscribe(() => {
        this.updateProfile()
        this.cd.markForCheck()
      });
    } else {
      this.notificationsUnseen = 0
      this.cd.markForCheck()
    }
    this.notifService.emitNotifChangeEvent(0)
    this._openNotifications = !this._openNotifications
  }
  

  constructor(private store: Store, private cd: ChangeDetectorRef, private info: InfoService, private popup: PopupService, private notifService: NotifService, private getUserDataService: getUserDataService) {
    super();
  }


  updateProfile() {
    console.log("update profile", this.profile)
    this.profile = this.store.selectSnapshot(DataQueries.currentProfile)
    console.log("updated profile", this.profile)
    this.notifications = []
    this.notificationsUnseen = 0
      // Arnaque du bug
      this.companyId = this.profile.user?.company!
      this.profile.company = this.store.selectSnapshot(DataQueries.getById('Company', this.companyId))!
      if (this.profile.company?.Notification) {
        for (const notification of this.store.selectSnapshot(DataQueries.getMany('Notification', this.profile.company!.Notification)))
          if (this.view == notification!.role) {
            this.notifications.push(notification!)
            if (!notification!.hasBeenViewed) {
              this.notificationsUnseen++
            }
          }
      }
      this.profileResume?.profileImage.updateProfile(this.profile);

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

  slideInviteFriends() {
    let content = document.getElementById("inviteFriendInput") as HTMLInputElement;
    // this.store.dispatch(new CloseMissionST(this.missionToClose!.id, this.missionToClose!.vibeST, this.missionToClose!.vibeCommentST, this.missionToClose!.securityST, this.missionToClose!.securityCommentST, this.missionToClose!.organisationST, this.missionToClose!.organisationCommentST)).pipe(take(1)).subscribe(() => {
    this.openMenu = false;
    this.openInviteFriendMenu = true
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
    this.store.dispatch(new Logout()).subscribe(() => {
    this.cd.markForCheck()
    let cookies = document.cookie.split(";")
    
    function deleteAllCookies() {
      var cookies = document.cookie.split(";");
  
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i];
          var eqPos = cookie.indexOf("=");
          var name = eqPos > -1 ? cookie[eqPos] : cookie;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    }
      deleteAllCookies()
    })
  }
  
  modifyProfile(form: any /*FormGroup*/) {
      const action = this.store.dispatch(new UserActions.ModifyUserProfile({profile: this.profile, form}));
      this.info.show("info", "Mise à jour en cours...", Infinity);
      action.pipe(take(1))
        .subscribe(
          success => {
          this.openModifyMenu = false;
          this.info.show("success", "Profil modifié avec succès", 2000);
          (form as FormGroup).markAsPristine(); (form as FormGroup).markAsUntouched();
          this.cd.markForCheck();
        },
        err => {
          console.log("error", err)
          // this.info.show("error", "Aucune valeur n'est modifiée", 5000);
          this.cd.markForCheck();
        }
        );
  }

  changePassword(form: FormGroup) {
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
    console.log(photo);
    this.openModifyPicture = false;
    this.store.dispatch(new UserActions.ChangeProfilePicture(photo, 'image'));
    this.updateProfile();

    this.cd.markForCheck();
  }

  async selectPhoto() {
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });

    console.log(photo)
    this.store.dispatch(new UserActions.ChangeProfilePicture(photo, 'image')).subscribe(() => {
      this.updateProfile();
      this.cd.markForCheck();
    });
    this.openModifyPicture = false;
  }

  openApplicationsMenu(){
    this.openMenu = false;
    this.openApplications = true;
  }

  ngOnDestroy(): void {
    this.info.alignWith("last");
    super.ngOnDestroy();
  }

};