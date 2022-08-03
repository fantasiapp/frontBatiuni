import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { Store } from "@ngxs/store";
import * as UserActions from "src/models/new/user/user.actions";
import { filter, take } from "rxjs/operators";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import {
  DataQueries,
  DataState,
  QueryProfile,
  SnapshotArray,
} from "src/models/new/data.state";
import {
  Job,
  File,
  Profile,
  JobForCompany,
} from "src/models/new/data.interfaces";
import { Observable } from "rxjs";
import { Destroy$ } from "src/app/shared/common/classes";
import { getFileColor } from "../../common/functions";
import { AppComponent } from "src/app/app.component";
import { BlockCompany } from "src/models/new/user/user.actions";
import { Router } from '@angular/router';
import { UISlideMenuComponent } from "../slidemenu/slidemenu.component";
import { UIAnnonceResume } from "src/app/mobile/ui/annonce-resume/annonce-resume.ui";
import { InfoService } from "../info/info.component";

@Component({
  selector: "extended-profile",
  templateUrl: "./extended-profile.component.html",
  styleUrls: ["./extended-profile.component.scss", "./desktop.extended.scss"],
  styles: [":host { overflow-y: auto; }"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtendedProfileComponent extends Destroy$ {
  @SnapshotArray("JobForCompany")
  companyJobs!: JobForCompany[];

  @SnapshotArray("Job")
  jobs!: Job[];

  // @SnapshotArray("File")
  files!: File[]; //only responsive to profile changes
  labelFiles: File[] = []
  attachedFiles: File[] = []
  @QueryProfile()
  @Input("profile")
  profile$!: number | Profile | Observable<Profile>;

  @Input()
  hideExactAdress: boolean = false;

  @Input()
  showContact: boolean = false;

  @Input()
  showSwitch: boolean = true;

  // rating demander recommandation button
  @Input()
  showRecomandation: boolean = true;

  @Input() showSignature: boolean = false;

  @Input()
  showView: "ST" | "PME" = this.store.selectSnapshot(DataState.view)

  @Input()
  showStar: boolean = true;
  
  constructor(
    private store: Store,
    private popup: PopupService,
    private cd: ChangeDetectorRef,
    private appComponent: AppComponent,
    private router: Router,
    private info: InfoService
  ) {
    super();
    this.info.alignWith('header')
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["profile$"] && !changes["profile$"].isFirstChange()) {
      this.initSubscribeProfile()
    }
  }

  ngOnInit() {
    this.initSubscribeProfile()
  }

  
  // get attachedFiles(): any[] {
  // }

  // get labelFiles(): any[] {
  // }

  
  initSubscribeProfile() {
    (this.profile$ as Observable<Profile>)
    .pipe(take(1))
    .subscribe((profile) => {
      console.log('profile', profile.company);
      this.files = this.store.selectSnapshot(DataQueries.getMany('File', profile.company.files))
      console.log('files', this.files);
      // this.files = profile.company.files as any;
      this.labelFiles =  this.files.filter((file) => file.nature == "labels")
      this.attachedFiles = this.files.filter(
        (file) => file.nature == "admin" 
      );

      console.log('filesLabel', this.labelFiles);
      this.companyJobs = profile.company.jobs as any;
      this.jobs = this.companyJobs.map(({ job }) => job) as any;

      this.cd.markForCheck()
  })
  }

  getFileColor(filename: string) {
    return getFileColor(filename);
  }

  //easier than requestFile, we can have direct access
  openFile(file: File) {
    this.popup.openFile(file);
  }

  hideAdress(adress?: string) {
    if (adress && this.hideExactAdress) {
      return adress!.replace(/\d+/, "").trim();
    } else {
      return adress;
    }
  }

  @Output()
  ratingsClicked = new EventEmitter();

  @Output()
  profileChanged = new EventEmitter<boolean>();

  @Output() viewChanged = new EventEmitter()
  onViewChanged(view: 'PME' | 'ST'){
    this.viewChanged.emit(view)
  }

  computeWebSite(websiteUrl: string){
    if(websiteUrl.substring(0, 4) && websiteUrl.substring(0, 4) == 'http') return websiteUrl
    return 'https://' + websiteUrl
  }

}
