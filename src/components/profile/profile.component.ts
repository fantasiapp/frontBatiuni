import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { SlidesDirective } from "src/directives/slides.directive";
import { User } from "src/models/User/user.model";
import { UserState } from "src/models/User/user.state";
import * as UserActions from "src/models/User/user.actions";
import { Option } from "../options/options";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { UISlideMenuComponent } from "src/app/ui/slidemenu/slidemenu.component";
import { UISwipeupComponent } from "src/app/ui/swipeup/swipeup.component";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { VerifyField } from "src/validators/verify";


@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  @ViewChild(UISwipeupComponent, {static: true})
  swipeMenu!: UISwipeupComponent;

  @ViewChild(UISlideMenuComponent, {static: true})
  slideMenu!: UISlideMenuComponent;

  @Select(UserState)
  user$!: Observable<User>;
  
  // Modify password 
  modifyPwdForm = new FormGroup({
    oldPwd: new FormControl('', [
      Validators.required
    ]),
    newPwd: new FormControl('',[
      Validators.required,
      Validators.minLength(8),      
    ]),
    newPwdConfirmation: new FormControl('',[
      Validators.required,
      Validators.minLength(8),      
    ])
  }, {validators: VerifyField('newPwd', 'newPwdConfirmation')})

  async modifyPwdAction(e: Event) {

  }

  //move to state
  openMenu: boolean = false;
  openModifyMenu: boolean = false;
  openRatings: boolean = false;
  modifyPassword: boolean = false;
  openModifyPicture: boolean = false;
  openNotifications : boolean = false;

  constructor(private store: Store) {

  }

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

  @ViewChild(SlidesDirective, {static: false})
  modifySlider!: SlidesDirective;

  @ViewChild('modifyMenu', {static: true, read: UISlideMenuComponent})
  modifyMenu!: UISlideMenuComponent;

  allLabels = ["Qualibat", "RGE", "RGE Eco Artisan", "NF", "Effinergie", "Handibat"]
    .map((name, id) => ({id, name, checked: false}));

  labels: Option[] = [];
  
  private fixScrollTop() {
    this.modifyMenu.resetScroll();
  }

  @HostListener('swipeleft')
  onSwipeLeft() {
    this.fixScrollTop();
    if ( this.openModifyMenu )
      this.modifySlider?.left();
  }
  
  @HostListener('swiperight')
  onSwipeRight() {
    this.fixScrollTop();
    if ( this.openModifyMenu )
      this.modifySlider?.right();
  }

  onSubmit() {
    let { oldPwd, newPwd } = this.modifyPwdForm.value;
    this.store.dispatch(new UserActions.ChangePassword(oldPwd, newPwd));
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
    
    console.log(photo);
    this.store.dispatch(new UserActions.ChangeProfilePicture('data:image/png;base64,' + photo.base64String!));
  }

  async selectPhoto() {
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    });

    this.store.dispatch(new UserActions.ChangeProfilePicture('data:image/png;base64,' + photo.base64String!));
  }
};