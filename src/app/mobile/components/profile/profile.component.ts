import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, ViewChild } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject, of } from "rxjs";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";
import * as UserActions from "src/models/user/user.actions";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { UISlideMenuComponent } from "../../ui/slidemenu/slidemenu.component";
import { Logout } from "src/models/auth/auth.actions";
import { InfoHandler, InfoService } from "src/app/shared/components/info/info.component";
import { take } from "rxjs/operators";
import { FormGroup } from "@angular/forms";
import { ModifyProfileForm } from "src/app/shared/forms/ModifyProfile.form";
import { FilesRow, UserProfileRow } from "src/models/data/data.model";
import { b64toBlob } from "src/app/shared/common/functions";
import { DomSanitizer } from "@angular/platform-browser";
import { Serialized } from "src/app/shared/common/types";
import { PopupService } from "src/app/shared/components/popup/popup.component";


@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {

  @ViewChild(ModifyProfileForm)
  modifyForm?: ModifyProfileForm;

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

  constructor(private store: Store, private cd: ChangeDetectorRef, private popup: PopupService	, private info: InfoService) {}

  slideModifyMenu(modifyPassword: boolean) {
    this.openMenu = false;
    this.openModifyMenu = true;
    this.modifyPassword = modifyPassword;

    if ( !this.modifyPassword ) {
      this.fixScrollTop();
      this.modifyForm?.reloadData();
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
    console.log('swiping');
    console.log(this.openModifyPicture = true);
  }
  
  logout() {
    this.store.dispatch(new Logout()).subscribe(console.log)
  }
  
  modifyProfile(form: any /*FormGroup*/) {
    const user = this.store.selectSnapshot(UserState);
    const action = this.store.dispatch(new UserActions.ModifyUserProfile({profile: user.profile, form}));
    this.info.show("info", "Mise à jour en cours...", Infinity);
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

  changePassword(form: FormGroup) {
    console.log(form, form.value);
    let { oldPwd, newPwd } = form.value;
    let req = this.store.dispatch(new UserActions.ChangePassword(oldPwd, newPwd));
    req.subscribe(
      success => { this.info.show("success", "Mot de passe changé avec succès", 2000); },
      error => { this.info.show("error", "Erreur lors du changement du mot de passe"); }
    )
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
  openFile(filename: string) {
    const user = this.store.selectSnapshot(UserState).profile as Serialized<UserProfileRow>,
      companyFiles = user.company.files,
      target = companyFiles.find(file => file.name == filename);
  
    if ( !target ) throw `file ${filename} doesn't exist on the current company`;
    const content = target.content ? of(target.content) : this.store.dispatch(new UserActions.DownloadFile(target.id));
    this.info.show('info', 'Téléchargement du fichier', Infinity);

    content.pipe(take(1)).subscribe(() => {
      const file = FilesRow.getById(target.id);
      this.popup.openFile(file);
      this.info.show('success', 'Fichier téléchargé', 2000);
    });
  }

  get attachedFiles(): any[] {
    const user = this.store.selectSnapshot(UserState).profile as Serialized<UserProfileRow>;
    return user.company.files.filter(file => file.nature == 'admin' || file.nature == 'labels');
  }

  getFileColor(filename: string) {
    return FilesRow.getFileColor(filename);
  }
};