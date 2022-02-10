import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, ViewChild } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { UserState } from "src/models/user/user.state";
import * as UserActions from "src/models/user/user.actions";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { UISlideMenuComponent } from "../../../shared/components/slidemenu/slidemenu.component";
import { Logout } from "src/models/auth/auth.actions";
import { InfoService } from "src/app/shared/components/info/info.component";
import { take } from "rxjs/operators";
import { FormGroup } from "@angular/forms";
import { ModifyProfileForm } from "src/app/shared/forms/ModifyProfile.form";
import { FilesRow, UserProfileRow } from "src/models/data/data.model";
import { Serialized } from "src/app/shared/common/types";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { DataQueries, QueryAll } from "src/models/new/data.state";
import { Company, File, User } from "src/models/new/data.interfaces";
import { Destroy$ } from "src/app/shared/common/classes";


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
  profile$!: Observable<{user: User, company: Company}>;


  constructor(private store: Store, private cd: ChangeDetectorRef, private info: InfoService, private popup: PopupService) {
    super();
    
    this.profile$.subscribe(console.log);
  }

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
    this.openModifyPicture = true;
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

    let imageName = user.profile.firstName + '_' + user.profile.lastName + '_' + user.profile.id ;
    this.store.dispatch(new UserActions.ChangeProfilePicture(photo, imageName));
  }

  get attachedFiles(): any[] {
    const user = this.store.selectSnapshot(UserState).profile as Serialized<UserProfileRow>;
    return user.company.files.filter(file => file.nature == 'admin' || file.nature == 'labels');
  }

  getFileColor(filename: string) {
    return FilesRow.getFileColor(filename);
  }

  //easier than requestFile, we can have direct access
  openFile(file: Serialized<FilesRow>) {
    const target = FilesRow.getById(file.id);
  
    if ( !target ) {
      this.info.show('error', `Le fichier "${file.name}" n'existe pas.`, 2000);
      return;
    }

    if ( target.content ) {
      this.popup.openFile(target);
    } else {
      this.info.show('info', 'Téléchargement du fichier ...', Infinity);

      this.store.dispatch(new UserActions.DownloadFile(target.id)).pipe(take(1))
        .subscribe(() => {
          const file = FilesRow.getById(target.id);
          this.popup.openFile(file);
          this.info.show('success', 'Fichier téléchargé', 1000);
        })
    }
  }
};