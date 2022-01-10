import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, ViewChild } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject, Observable, of } from "rxjs";
import { SlidesDirective } from "src/app/shared/directives/slides.directive";
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
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatchField } from "src/validators/verify";
import { AppState } from "src/app/app.state";


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

  @Select(UserState)
  user$!: BehaviorSubject<User>;
  userData = this.store.selectSnapshot(UserState).profile
  // Modify User profile
  modifyUser = new FormGroup({
    // User
    lastName: new FormControl(this.userData.lastName, [
      Validators.required
    ]),
    firstName: new FormControl(this.userData.firstName, [
      Validators.required
    ]),
    user: new FormControl(this.userData.user, [
      Validators.required
    ]),
    cellPhone: new FormControl(this.userData.cellPhone, [
      Validators.required
    ]),
    // Company 
    name: new FormControl(this.userData.company.name, [
    ]),
    siret: new FormControl(this.userData.company.siret, [
    ]),
    capital: new FormControl(this.userData.company.capital, [
    ]),
    webSite: new FormControl(this.userData.company.webSite, [
    ]),
  });



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
  }, {validators: MatchField('newPwd', 'newPwdConfirmation')})

  profileImage$ = this.user$.pipe(take(1), map(user => {
    if ( user.imageUrl ) return user.imageUrl;
    const fullname = user.profile!.firstName[0].toUpperCase() + user.profile!.lastName[0].toUpperCase();
    return this.imageGenerator.generate(fullname);
  }))
  
  async modifyPwdAction(e: Event) {
    
  }

  //move to state
  openMenu: boolean = false;
  openModifyMenu: boolean = false;
  openRatings: boolean = false;
  modifyPassword: boolean = false;
  openModifyPicture: boolean = false;
  openNotifications : boolean = false;

  constructor(private store: Store, private imageGenerator: ImageGenerator) {
    
  }

  generateDefaultImage() {
    return this.user$.pipe(take(1), map(user => {
      const fullname = user.profile!.firstName + user.profile!.lastName;
      return this.imageGenerator.generate(fullname);
    }));
  }

  async ngOnInit() {
    console.log(this.store.selectSnapshot(AppState))
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

  @ViewChild('modifyMenu', {static: false, read: UISlideMenuComponent})
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
      this.modifySlider.left();
  }
  
  @HostListener('swiperight')
  onSwipeRight() {
    this.fixScrollTop();
    if ( this.openModifyMenu )
      this.modifySlider.right();
  }
  logout(){
    this.store.dispatch(new Logout()).subscribe(console.log)
  }
  
  modifyProfileAction(){
    let value = this.modifyUser.value;
    let postValues = {
      "UserprofileValues": {
       
      }
    }
  }

  changePasswordAction() {
    let { oldPwd, newPwd } = this.modifyPwdForm.value;
    let req = this.store.dispatch(new UserActions.ChangePassword(oldPwd, newPwd));
    req.subscribe(console.log);
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

  onSubmit() {}
};