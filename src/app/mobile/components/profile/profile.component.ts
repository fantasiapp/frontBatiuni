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
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatchField } from "src/validators/verify";
import { getDirtyValues } from "src/common/functions";
import { Email } from "src/validators/persist";
import { AppState } from "src/app/app.state";
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

  @Select(UserState)
  user$!: BehaviorSubject<User>;
  userData = this.store.selectSnapshot(UserState).profile as UserProfile;
  
  // Modify User profile
  modifyProfileForm = new FormGroup({
    // User
    'Userprofile.lastName': new FormControl(this.userData.lastName, [
    ]),
    'Userprofile.firstName': new FormControl(this.userData.firstName, [
    ]),
    'Userprofile.user': new FormControl(this.userData.userName, [
      Email()
    ]),
    'Userprofile.cellPhone': new FormControl(this.userData.cellPhone, [
    ]),
    'Userprofile.jobs': new FormArray([
      ...this.userData.jobs.map((job: Job) => new FormGroup({
        job: new FormControl(job),
        number: new FormControl(1)
      }))
    ]),
    // Company 
    'Company.name': new FormControl(this.userData.company.name, [
    ]),
    'Company.siret': new FormControl(this.userData.company.siret, [
    ]),
    'Company.capital': new FormControl(this.userData.company.capital, [
    ]),
    'Company.webSite': new FormControl(this.userData.company.webSite, [
    ]),
    'Company.companyPhone': new FormControl(this.userData.company.companyPhone, [])
  });

  get profileJobsControls() {
    const jobsControl = this.modifyProfileForm.controls['Userprofile.jobs'] as FormArray;
    return jobsControl.controls;
  }


  addingField: boolean = false;

  profileImage$ = this.user$.pipe(take(1), map(user => {
    if ( user.imageUrl ) return user.imageUrl;
    const fullname = user.profile!.firstName[0].toUpperCase() + user.profile!.lastName[0].toUpperCase();
    return this.imageGenerator.generate(fullname);
  }))

  //move to state
  openMenu: boolean = false;
  openModifyMenu: boolean = false;
  openRatings: boolean = false;
  modifyPassword: boolean = false;
  openModifyPicture: boolean = false;
  openNotifications : boolean = false;

  constructor(private store: Store, private imageGenerator: ImageGenerator) {}

  generateDefaultImage() {
    return this.user$.pipe(take(1), map(user => {
      const fullname = user.profile!.firstName + user.profile!.lastName;
      return this.imageGenerator.generate(fullname);
    }));
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

  @ViewChild('modifyMenu', {static: false, read: UISlideMenuComponent})
  modifyMenu!: UISlideMenuComponent;

  allLabels = ["Qualibat", "RGE", "RGE Eco Artisan", "NF", "Effinergie", "Handibat"]
    .map((name, id) => ({id, name, checked: false}));
  
  allJobs = [...Job.instances.values()].map(job => ({id: job.id, name: job.name, checked: this.userData.jobs.includes(job)}))

  updateJobs(jobOptions: Option[]) {
    const jobsControl = this.modifyProfileForm.controls['Userprofile.jobs'] as FormArray,
      oldJobs = jobsControl.value as {job: Job, number: number}[],
      newJobs = jobOptions.map(option => Job.getById(option.id)!);

    const
      newEntries = newJobs.map(newJob => [newJob, 1] as [Job, number]),
      oldEntries = oldJobs
        .filter(oldJob => newJobs.includes(oldJob.job))
        .map(oldJob => [oldJob.job, oldJob.number] as [Job, number]);


    const countMap = new Map<Job, number>([
      ...newEntries,
      ...oldEntries
    ]);

    jobsControl.clear();
    [...countMap.entries()].forEach(([job, number]) => {
      jobsControl.push(new FormGroup({
        job: new FormControl(job),
        number: new FormControl(number)
      }))
    });
  };

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
  
  modifyProfile(){
    console.log(getDirtyValues(this.modifyProfileForm));
    this.store.dispatch(new UserActions.ModifyUserProfile(this.modifyProfileForm));
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
    let user = this.user$.subscribe(user=> {
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