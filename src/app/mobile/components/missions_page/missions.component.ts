import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
} from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { combineLatest, Observable } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { assignCopy } from "src/app/shared/common/functions";
import { MissionDetailedDay } from "src/app/shared/components/horizontalcalendar/horizontal.component";
import { InfoService } from "src/app/shared/components/info/info.component";
import {
  Mission,
  DatePost,
  PostDetail,
  PostMenu,
  Profile,
  Ref,
} from "src/models/new/data.interfaces";
import { DataQueries, QueryAll } from "src/models/new/data.state";
import { CloseMissionST, MarkViewed, PostNotificationViewed } from "src/models/new/user/user.actions";
import { UIAnnonceResume } from "../../ui/annonce-resume/annonce-resume.ui";
import { getLevenshteinDistance } from "src/app/shared/services/levenshtein";

import * as moment from "moment";
import { AppComponent } from "src/app/app.component";
import { SearchbarComponent } from "src/app/shared/components/searchbar/searchbar.component";
import { getUserDataService } from "src/app/shared/services/getUserData.service";
import { MissionFilterForm } from "src/app/shared/forms/missions.form";
import { NotifService } from "src/app/shared/services/notif.service";
import { UISlideMenuComponent } from "src/app/shared/components/slidemenu/slidemenu.component";
import { Mobile } from "src/app/shared/services/mobile-footer.service";

@Component({
  selector: "missions",
  templateUrl: "missions.component.html",
  styleUrls: ["missions.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MissionsComponent extends Destroy$ {
  activeView: number = 0;

  openFilterMenu: boolean = false;
  myMissions: Mission[] = [];
  allMyMissions: Mission[] = [];
  missionToRate:  Mission[] = [];
  missionMenu = new PostMenu<Mission>();
  filterOn: boolean = false;
  viewList: boolean = true;
  submitStarsST: boolean = false;

  detailedDays: MissionDetailedDay[] = [];
  _openCloseMission = false;
  doClose: boolean = false;
  missionCompany: String = "";

  searchbar!: SearchbarComponent;

  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  @QueryAll("Mission")
  missions$!: Observable<Mission[]>;

  @ViewChild(MissionFilterForm)
  filterMission!: MissionFilterForm;
  showFooter: boolean = false;

  constructor(
    private store: Store,
    private info: InfoService,
    private cd: ChangeDetectorRef,
    private appComponent: AppComponent,
    private getUserDataService: getUserDataService,
    private notifService: NotifService,
    private mobileFooterService: Mobile
  ) {
    super();
    this.searchbar = new SearchbarComponent(store, cd);
  }

  ngOnInit() {
    this.mobileFooterService.footerStateSubject.pipe(takeUntil(this.destroy$)).subscribe((b) => {
      this.showFooter = b;
      this.cd.markForCheck();
    });
    this.info.alignWith('header_search');


    combineLatest([this.profile$, this.missions$]).pipe(takeUntil(this.destroy$)).subscribe(([profile, missions]) => {
      this.info.enableBothOverlay(profile.company && profile.company.role == 3)
      console.log('INFO BOTH JSGSDGSG', profile.company && profile.company.role == 3);
      //filter own missions
      //for now accept all missions
      this.allMyMissions = missions.filter(mission => mission.subContractor == profile.company.id);
      //compute work days

      this.detailedDays = [];
      let usedDay: number[] = []
      for ( let mission of this.allMyMissions ) {
        mission = this.store.selectSnapshot(DataQueries.getById('Mission', mission.id)) as Mission

        // console.log('mission', mission);
        // console.log('mission truc',
        //   this.store.selectSnapshot(DataQueries.getMany('DetailedPost', mission.details)),
        //   this.store.selectSnapshot(DataQueries.getMany('DatePost', mission.dates)),
        //   this.store.selectSnapshot(DataQueries.getMany('File', mission.files)),
        //   this.store.selectSnapshot(DataQueries.getMany('Candidate', mission.candidates))
        // );
        const availabilities = this.store.selectSnapshot(DataQueries.getMany('Disponibility', profile.company.availabilities))
        const start = moment(mission.startDate),
          end = moment(mission.endDate),
          contractor = this.store.selectSnapshot(DataQueries.getById('Company', mission.company))!;
        
        const tasks: PostDetail[] = this.store.selectSnapshot(DataQueries.getMany('DetailedPost', mission.details))
        
        // const diffDays = end.diff(start, 'days', true);
        // let day = start.clone();
        let missionDatesId: Ref<DatePost>[];
        if (typeof mission.dates === "object" && !Array.isArray(mission.dates)) {
          missionDatesId = Object.keys(mission.dates).map(key => (+key as number))
        }
        else missionDatesId = mission.dates
        let dateAlreadyParsedFromMission:string[] = []


        for(let i= 0; i < missionDatesId.length; i++){
          const dateid = missionDatesId[i]
          let date = this.store.selectSnapshot(DataQueries.getById('DatePost', dateid))
          dateAlreadyParsedFromMission.push(date!.date)
  
          this.detailedDays.push({
            date: date!.date,
            datePost: date!,
            mission: mission,
            title: 'Chantier de ' + contractor.name,
            tasks: this.store.selectSnapshot(DataQueries.getMany('DetailedPost', date!.details))
          })
          // for (const task of tasks) {
          //   if(date!.date == task.date){
          //     let lenght = this.detailedDays.length
          //     if (lenght != 0) this.detailedDays[lenght -1].tasks.push(task)  
          //   }
          // }
        }
    }});
    this.missionToRate = this.allMyMissions.filter((mission) => mission.isClosed && (mission.vibeST == 0 || mission.securityST == 0 || mission.organisationST == 0))
    if (this.missionToClose) {
      this._openCloseMission = this.missionToClose.securityST == 0;
      const company = this.store.selectSnapshot(
        DataQueries.getById("Company", this.missionToClose.company)
      );
      this.missionCompany = company!.name;
      this._openCloseMission = true;
    } else {
      this._openCloseMission = false;
    }
    this.selectMissions(null);
    this.filterOn = false;
  }

  ngAfterViewInit() {
  }

  changeView(headerActiveView: number) {
    if (headerActiveView == 0){
      this.searchbar.resetSearch()
      this.viewList = true;
      this.filterMission.onResetFilter();
      this.filterOn = false;
    }  
    if (headerActiveView == 1) {
      this.searchbar.resetSearch()
      this.viewList = false;
      this.filterOn = false;
    }    
  }
  
  isFilterOn(filter: any){
    if (filter.address == "" && filter.isClosed == false && filter.jobs.length == 0 && filter.manPower == null && filter.missionDate == "" && filter.sortMissionDate == false && filter.unread == false && filter.validationDate == ""){
      this.filterOn = false;
    } else {
      this.filterOn = true;
      // this.info.show("info","Vos filtres ont ??t?? appliqu??s", 1000);
    }
    console.log('this.filterOn', this.filterOn);
    this.cd.markForCheck()
  }

  callbackFilter = (filter: any): void => {
    this.selectMissions(filter);
    this.isFilterOn(filter);
  };

  selectSearchMission(searchForm:  string){
    this.myMissions = [];
    this.allMyMissions.sort((a, b) => {return Number(a["isClosed"]) - Number(b["isClosed"]);});
    if (searchForm == "" || searchForm == null)  {
      this.myMissions = this.allMyMissions
    } else {
      let levenshteinDist: any = [];
      for (let mission of this.allMyMissions) {
        let postString = this.searchbar.missionToString(mission)
        levenshteinDist.push([mission,getLevenshteinDistance(postString.toLowerCase(),searchForm.toLowerCase()),]);
      }
      levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
      let keys = levenshteinDist.map((key: any) => { return key[0]; });
      this.allMyMissions.sort((a: any,b: any)=>keys.indexOf(a) - keys.indexOf(b));
      this.myMissions = this.allMyMissions
    }
    this.cd.markForCheck();
  }

  callbackSearch = (search: any): void => {
    this.selectSearchMission(search)
  };

  selectMissions(filter: any) {
    this.myMissions = [];
    this.allMyMissions.sort((a, b) => {return Number(a["isClosed"]) - Number(b["isClosed"]);});
    let allNotifications = this.store.selectSnapshot(DataQueries.getAll("Notification"));
    let missionsNotifications = allNotifications.map(notification => notification.missions);
    let missionArray = [];
    for (let mission of this.allMyMissions){
      let missionNotifications = missionsNotifications.map(missionId => missionId === mission.id)
      const countTrue = missionNotifications.filter(value => value === true).length;
      missionArray.push([mission, countTrue]);
    }
    missionArray.sort((a: any, b: any) => b[1] - a[1]);
    let keys = missionArray.map((key: any) => {return key[0]});
    this.allMyMissions.sort((a: any, b: any) => keys.indexOf(a) - keys.indexOf(b));
    
    console.log("NOTIF", allNotifications)
    if (filter == null) {
      this.myMissions = this.allMyMissions;
    } else {
      //Trie en distance Levenshtein pour une adresse demand??e
      let levenshteinDist: any = [];
      if (filter.address) {
        for (let mission of this.allMyMissions) {
          levenshteinDist.push([mission,getLevenshteinDistance(mission.address.toLowerCase(),filter.address.toLowerCase()),]);
        }
        levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
        let keys = levenshteinDist.map((key: any) => {return key[0];});
        this.allMyMissions.sort((a: any, b: any) => keys.indexOf(a) - keys.indexOf(b));
      } 

      // Trie les missions par date plus proche
      if (filter.sortMissionDate === true) {this.allMyMissions.sort((a: any, b: any) => Date.parse(a['startDate']) - Date.parse(b['startDate']))}

      // Trie Notifications non lus
      if (filter.sortMissionNotifications) {
        let allNotifications = this.store.selectSnapshot(DataQueries.getAll("Notification"));
        let missionsNotifications = allNotifications.map(notification => notification.missions);
        let missionArray = [];
        for (let mission of this.allMyMissions){
          let missionNotifications = missionsNotifications.map(missionId => missionId === mission.id)
          const countTrue = missionNotifications.filter(value => value === true).length;
          missionArray.push([mission, countTrue]);
        }
        missionArray.sort((a: any, b: any) => b[1] - a[1]);
        let keys = missionArray.map((key: any) => {return key[0]});
        this.allMyMissions.sort((a: any, b: any) => keys.indexOf(a) - keys.indexOf(b));
      }
    

      for (let mission of this.allMyMissions) {
      
      let isDifferentValidationDate = (filter.validationDate && filter.validationDate != mission.dueDate)
      let isNotInMissionDate = (filter.missionDate && mission.startDate < filter.date)       
      let isDifferentManPower = (filter.manPower && mission.manPower != (filter.manPower === "true"))
      let isNotIncludedJob = (filter.jobs && filter.jobs.length && filter.jobs.every((job: any) => {return job.id != mission.job}))
      const user = this.store.selectSnapshot(DataQueries.currentUser);
      let isUnread = (filter.unread && user.viewedPosts.includes(mission.id) == filter.unread);
      let isNotClosed = (filter.isClosed && mission.isClosed != filter.isClosed)

      if ( isDifferentValidationDate || isNotInMissionDate || isDifferentManPower || isNotIncludedJob || isUnread || isNotClosed) { continue }
      this.myMissions.push(mission)
      }
    }
    this.cd.markForCheck();
  }

  computeSupervisionsforTask(
    supervisions: number[],
    supervisionsTaks: any
  ): any {
    throw new Error("Method not implemented.");
  }

  openMission(mission: Mission | null) {
    let company = this.store.selectSnapshot(DataQueries.currentCompany)
    this.store.dispatch(new PostNotificationViewed(mission!.id, "ST"))
    this.notifService.emitNotifChangeEvent()
    this.missionMenu = assignCopy(this.missionMenu, {
      post: mission,
      open: !!mission,
      swipeup: false,
    });
    if (mission) this.store.dispatch(new MarkViewed(mission.id));
    if (mission?.isClosed) {
      this.info.show(
      "info",
      "Mission cl??tur??e",
      Infinity
    );}
    // this.searchbar.resetSearch()
    // this.filterOn = false;
    // this.filterMission.resetFilter()
  }


  @ViewChild("slideOnlinePost") private slideOnlinePost!: UISlideMenuComponent;

  slideOnlinePostClose() {
    this.cd.markForCheck()
    // Close View
    this.slideOnlinePost.close();

    // reset searchbar
    this.searchbar.resetSearch()
    this.filterMission.onResetFilter()
    this.filterOn= false;

  }


  ngOnDestroy(): void {
    this.info.alignWith("last");
    this.getUserDataService.emitDataChangeEvent();
    super.ngOnDestroy();
  }

  get missionToClose(): Mission | null {
    const missionToClose = this.missionToRate.filter((mission) => !this.submitStarsST)
    if (missionToClose.length != 0) {
      return missionToClose[0];
    }
    return null;
  }

  get classSubmit() {
    if (this.hasGeneralStarsST) {
      return "submitActivated";
    } else {
      return "submitDisable";
    }
  }

  get openCloseMission() {
    return this._openCloseMission;
  }
  set openCloseMission(b: boolean) {
    this._openCloseMission = b;
  }

  get hasGeneralStarsST() {
    return this.getArrayStarST("generalST")[0] == true;
  }

  submitStarST(button: HTMLButtonElement) {
    if (!this.hasGeneralStarsST) return
    this.store.dispatch(new CloseMissionST(this.missionToClose!.id, this.missionToClose!.vibeST, this.missionToClose!.vibeCommentST, this.missionToClose!.securityST, this.missionToClose!.securityCommentST, this.missionToClose!.organisationST, this.missionToClose!.organisationCommentST)).pipe(take(1)).subscribe(() => {
      this.doClose = true;
      this.openCloseMission = false;
      this.cd.markForCheck();
      this.submitStarsST = true;
    });
  }

  starActionST(index: number, nature: string) {
    if (nature == "vibeST") {this.missionToClose!.vibeST = index + 1;}
    if (nature == "securityST") {this.missionToClose!.securityST = index + 1;}
    if (nature == "organisationST") {this.missionToClose!.organisationST = index + 1;}
    this.cd.markForCheck();
  }

  textStarActionST(nature: string) {
    if (nature == "vibeST") {
      let content = document.getElementById(
        "starTextVibeST"
      ) as HTMLTextAreaElement;
      this.missionToClose!.vibeCommentST = content!.value;
    } else if (nature == "securityST") {
      let content = document.getElementById(
        "starTextSecurityST"
      ) as HTMLTextAreaElement;
      this.missionToClose!.securityCommentST = content!.value;
    } else if (nature == "organisationST") {
      let content = document.getElementById(
        "starTextOrganisationST"
      ) as HTMLTextAreaElement;
      this.missionToClose!.organisationCommentST = content!.value;
    }
  }

  getArrayStarST(nature: string) {
    let array = new Array<boolean>(5);
    if (this.missionToClose) {
      let lastStar = 0;
      if (nature == "vibeST") {
        lastStar = this.missionToClose!.vibeST;
      } else if (nature == "securityST") {
        lastStar = this.missionToClose!.securityST;
      } else if (nature == "organisationST") {
        lastStar = this.missionToClose!.organisationST;
      } else if (nature == "generalST") {
        if (
          this.missionToClose!.vibeST &&
          this.missionToClose!.securityST &&
          this.missionToClose!.organisationST
        ) {
          lastStar = Math.round(
            (this.missionToClose!.vibeST +
              this.missionToClose!.securityST +
              this.missionToClose!.organisationST) /
              3
          );
        }
      }
      for (let index = 0; index < 5; index++) {
        array[index] = index < lastStar ? true : false;
      }
    }
    return array;
  }

}

function supervisionsTaks(supervisions: number[], supervisionsTaks: any): any {
  throw new Error("Function not implemented.");
}
