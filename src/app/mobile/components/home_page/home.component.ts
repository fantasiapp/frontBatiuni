import {
  Component,
  ChangeDetectionStrategy,
  SimpleChange,
  SimpleChanges,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
  Input,
  EventEmitter,
  Output,
  HostBinding,
} from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { combineLatest, Observable, Subject, throwError } from "rxjs";
import { catchError, take, takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import {
  DistanceSliderConfig,
  SalarySliderConfig,
} from "src/app/shared/common/sliderConfig";
import { assignCopy, delay, splitByOutput } from "src/app/shared/common/functions";
import { InfoService } from "src/app/shared/components/info/info.component";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import {
  SlidemenuService,
  UISlideMenuComponent,
} from "src/app/shared/components/slidemenu/slidemenu.component";
import { SwipeupService } from "src/app/shared/components/swipeup/swipeup.component";
import {
  ApplyPost,
  CandidateViewed,
  DeletePost,
  DuplicatePost,
  GetUserData,
  HandleApplication,
  BlockCompany,
  MarkViewed,
  SetFavorite,
  SwitchPostType,
  PostNotificationViewed,
} from "src/models/new/user/user.actions";
import { DataQueries, DataState, QueryAll } from "src/models/new/data.state";
import {
  Profile,
  Post,
  Mission,
  PostMenu,
  Candidate,
  User,
} from "src/models/new/data.interfaces";
import { FilterService } from "src/app/shared/services/filter.service";
import {
  ApplyForm,
  UIAnnonceResume,
} from "../../ui/annonce-resume/annonce-resume.ui";
import { Mobile } from "src/app/shared/services/mobile-footer.service";
import { getLevenshteinDistance } from "src/app/shared/services/levenshtein";

import { AuthState } from "src/models/auth/auth.state";
import { Logout } from "src/models/auth/auth.actions";
import { AppComponent } from "src/app/app.component";
import { BooleanService } from "src/app/shared/services/boolean.service";
import { STFilterForm } from "src/app/shared/forms/STFilter.form";
import { PMEFilterForm } from "src/app/shared/forms/PMEFilter.form";
import { SearchbarComponent } from "src/app/shared/components/searchbar/searchbar.component";
import { getUserDataService } from "src/app/shared/services/getUserData.service";
import { Router } from "@angular/router";
import { NotifService } from "src/app/shared/services/notif.service";
import { ActiveViewService } from "src/app/shared/services/activeView.service";

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent extends Destroy$ {
  profileSubContractor: Profile | null = null;
  amountSubContractor: String | null = null;

  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  @Select(DataState.view)
  view$!: Observable<"PME" | "ST">;

  time: number = 0;

  @QueryAll("Post")
  posts$!: Observable<Post[]>;

  //split the set all of posts into these (what we need)
  private symbols = {
    userDraft: 0,
    userOnlinePost: 1,
    otherOnlinePost: 2,
    discard: -1,
  };

  userDrafts: Post[] = [];
  allUserDrafts: Post[] = [];
  userOnlinePosts: Post[] = [];
  allUserOnlinePosts: Post[] = [];
  displayOnlinePosts: Post[] = [];
  allOnlinePosts: Post[] = [];
  missions: Mission[] = [];
  allMissions: Mission[] = [];
  filterOn: boolean = false;
  filterOnST: boolean = false;
  isStillOnPage: boolean = true;

  possibleCandidates: Candidate[] = [];

  get missionToClose() {
    return this.missions[0];
  }

  @ViewChild("pausePostTemplate", { read: TemplateRef, static: true })
  pausePostTemplate!: TemplateRef<any>;

  @ViewChild("acceptOffer", { read: TemplateRef, static: true })
  acceptOfferTemplate!: TemplateRef<any>;

  @ViewChild("candidates", { read: TemplateRef, static: true })
  candidatesTemplate!: TemplateRef<any>;

  @ViewChild("candidature", { read: TemplateRef, static: true })
  candidature!: TemplateRef<any>;

  @ViewChild("suiviPME", { read: TemplateRef, static: true })
  suiviChantier!: TemplateRef<any>;

  @ViewChild("booster", { read: TemplateRef, static: true })
  boosterTemplate!: TemplateRef<any>;

  @ViewChild(PMEFilterForm)
  filterPME!: PMEFilterForm;

  @ViewChild(STFilterForm)
  filterST!: STFilterForm;

  searchbar!: SearchbarComponent;

  activeView: number;
  _openCloseMission: boolean = false;
  openAdFilterMenu: boolean = false;
  toogle: boolean = false;
  isLoading: boolean;
  imports = { DistanceSliderConfig, SalarySliderConfig };
  draftMenu = new PostMenu();
  postMenu = new PostMenu();
  missionMenu = new PostMenu<Mission>();

  searchBarEmpty: boolean = true;

  showFooter: boolean = true;
  constructor(
    private cd: ChangeDetectorRef,
    private appComponent: AppComponent,
    private store: Store,
    private info: InfoService,
    private popup: PopupService,
    private swipeupService: SwipeupService,
    private slideService: SlidemenuService,
    private filters: FilterService,
    private mobile: Mobile,
    private booleanService: BooleanService,
    private filterService: FilterService,
    private getUserDataService: getUserDataService,
    private router: Router,
    private notifService: NotifService,
    private activeViewService: ActiveViewService
  ) {
    super();
    this.isLoading = this.booleanService.isLoading
    this.searchbar = new SearchbarComponent(store, cd);
    this.activeView = activeViewService.activeView
  }
  
  ngOnInit() {
    this.booleanService.getLoadingChangeEmitter().subscribe((bool : boolean) => {
      console.log("tout va bien")
      this.isLoading = bool
      this.cd.markForCheck()
    })
    this.filterService.getFilterChangeEmitter().subscribe((posts: Post[]) => {
      this.displayOnlinePosts = posts
      this.cd.markForCheck()
    })
    this.mobile.footerStateSubject.subscribe((b) => {
      this.showFooter = b;
      this.cd.markForCheck();
    });
    this.getUserDataService.getDataChangeEmitter().subscribe((value: boolean) => {
      this.lateInit()
    })
    this.activeViewService.getActiveViewChangeEmitter().subscribe((num: number) => {
      this.slideMissionClose()
      this.activeView = num
      console.log("j'ai changé", this.activeView)
    })
    this.lateInit()
  }

  async lateInit() {
    this.activeViewService.setActiveView(0)
    if (!this.isLoading && this.isStillOnPage) {
      this.info.alignWith("header_search");
      combineLatest([this.profile$, this.store.select(DataQueries.getAll('Post'))])
        .pipe(takeUntil(this.destroy$))
        .subscribe(([profile, posts]) => {
          console.log(posts)
          const mapping = splitByOutput(posts, (post) => {
            //0 -> userOnlinePosts | 1 -> userDrafts
            if (profile.company.posts.includes(post.id))
              return post.draft
                ? this.symbols.userDraft
                : this.symbols.userOnlinePost;
  
            return post.draft
              ? this.symbols.discard
              : this.symbols.otherOnlinePost;
          });
          const otherOnlinePost = mapping.get(this.symbols.otherOnlinePost) || [];
          this.allUserDrafts = mapping.get(this.symbols.userDraft) || [];
          this.allUserOnlinePosts = mapping.get(this.symbols.userOnlinePost) || [];
          this.allOnlinePosts = [...otherOnlinePost, ...this.userOnlinePosts];
          this.allMissions = this.store.selectSnapshot(DataQueries.getMany("Mission", profile.company.missions));
          const now = (new Date).toISOString().slice(0, 10);
          this.allUserOnlinePosts = this.allUserOnlinePosts.filter((post) => post.dueDate > now)
          if (this.filterST) {this.filterST.updatePosts(this.allOnlinePosts)}
          this.selectDraft(null);
          this.selectUserOnline(null);
          this.selectMission(null);
          this.selectSearchDraft("");
          this.selectSearchOnline("");
          this.selectSearchMission("");
        });
      this.time = this.store.selectSnapshot(DataState.time);
      this.updatePage()
    }
    else {
      await delay(2000)
      this.lateInit()
      this.cd.markForCheck()
    }
  }

  @HostBinding('class.footerHide')
  get footerHide(){return !this.showFooter}

  ngOnDestroy(): void {
    this.isStillOnPage = false
    this.info.alignWith("last");
    this.getUserDataService.emitDataChangeEvent();
    super.ngOnDestroy();
  }

  ngAfterViewInit() {
    if (this.filterST) {
      this.filterST.updateFilteredPosts(this.filterST.filterForm.value)
      this.displayOnlinePosts = this.filterST.filteredPosts;
    }
    this.updatePage()
  }

  updatePage() {
    this.updatePossibleCandidates();
    this.cd.markForCheck()
  }

  get openCloseMission() {
    return this._openCloseMission;
  }
  set openCloseMission(b: boolean) {
    this._openCloseMission = !this._openCloseMission;
  }

  selectDraft(filter: any) {
    this.userDrafts = [];
    this.allUserDrafts.sort((post1, post2) => {
      let b1 = post1.boostTimestamp > this.time ? 1 : 0;
      let b2 = post2.boostTimestamp > this.time ? 1 : 0;
      return b2 - b1
    })
    if (filter == null) {
      this.userDrafts = this.allUserDrafts;
    } else {
       // Trie les posts selon leur distance de levenshtein
      let levenshteinDist: any = [];
      if (filter.address) {
        for (let post of this.allUserDrafts) {levenshteinDist.push([post,getLevenshteinDistance(post.address.toLowerCase(),filter.address.toLowerCase()),]);}
        levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
        let keys = levenshteinDist.map((key: any) => {return key[0];});
        this.allUserDrafts.sort((a: any,b: any)=>keys.indexOf(a) - keys.indexOf(b));
      } 

      // Trie brouillons les plus anciens
      if (filter.sortDraftDate === true) {this.allUserDrafts.sort((a: any, b: any) => Date.parse(a['creationDate']) - Date.parse(b['creationDate']))} 

      // Trie les brouillons les plus complets (selon leurs details + nb de documents)
      let detailPost: any = []; 
      if (filter.sortDraftFull === true) {
        for (let post of this.allUserDrafts){
          detailPost.push([post, post.details.length + post.files.length]) ;
        }
        detailPost.sort((a: any, b: any) => b[1] - a[1]);
        let detailKeys = detailPost.map((key: any) => {return key[0]});
        this.allUserDrafts.sort((a: any, b: any) => detailKeys.indexOf(a) - detailKeys.indexOf(b));
      }

      for (let post of this.allUserDrafts) {

        let isDifferentDate = (filter.date && post.startDate < filter.date)
        let isDifferentManPower = (filter.manPower && post.manPower != (filter.manPower === "true"))
        let isNotIncludedJob = (filter.jobs && filter.jobs.length && filter.jobs.every((job: any) => {return job.id != post.job}))

        if (isDifferentDate || isDifferentManPower || isNotIncludedJob) { continue }
        this.userDrafts.push(post);
      }
    }
    this.cd.markForCheck();
  }

  selectUserOnline(filter: any) {
    this.userOnlinePosts = [];
    const now = (new Date).toISOString().slice(0, 10);
    this.allUserOnlinePosts = this.allUserOnlinePosts.filter((post) => post.dueDate > now)
    this.allUserOnlinePosts.sort((post1, post2) => {
      let b1 = post1.boostTimestamp > this.time ? 1 : 0;
      let b2 = post2.boostTimestamp > this.time ? 1 : 0;
      return b2 - b1
    });

    // Trie Posts selon leurs réponses
    let responses = [];
    for (let post of this.allUserOnlinePosts) {
      const candidatesIds = post.candidates || [],
      candidates = this.store.selectSnapshot(DataQueries.getMany("Candidate", candidatesIds));
      let possCandidate = candidates.reduce((possibleCandidates: Candidate[], candidate: Candidate) => { 
        if (!candidate.isRefused) {possibleCandidates.push(candidate)}
        return possibleCandidates; 
      }, []);
      responses.push([post, possCandidate.length])
    }
    responses.sort((a: any,b: any) => b[1] - a[1]);
    let keys = responses.map((key: any) => { return key[0] });    
    this.allUserOnlinePosts.sort((a: any,b: any)=>keys.indexOf(a) - keys.indexOf(b));
    
    if (filter == null) {
      this.userOnlinePosts = this.allUserOnlinePosts;
    } else {
      // On trie les posts selon leur distance de levenshtein
      let levenshteinDist: any = [];
      if (filter.address) {
        for (let post of this.allUserOnlinePosts) {levenshteinDist.push([post,getLevenshteinDistance(post.address.toLowerCase(),filter.address.toLowerCase()),])}
        levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
        let keys = levenshteinDist.map((key: any) => { return key[0] })
        this.allUserOnlinePosts.sort((a: any, b: any) => keys.indexOf(a) - keys.indexOf(b))
      } 
      

      for (let post of this.allUserOnlinePosts) {
        
        let isDifferentDate = (filter.date &&  post.startDate < filter.date)
        let isDifferentManPower = (filter.manPower && post.manPower != (filter.manPower === "true"))
        let isNotIncludedJob = (filter.jobs && filter.jobs.length && filter.jobs.every((job: any) => {return job.id != post.job}))

        if ( isDifferentDate || isDifferentManPower || isNotIncludedJob) { continue }
        this.userOnlinePosts.push(post)
      }  
    }
    this.cd.markForCheck();
  }

  selectMission(filter: any) {
    this.missions = [];
    this.allMissions.sort((a, b) => {return Number(a["isClosed"]) - Number(b["isClosed"]);});
    console.log("this.allMissions", this.allMissions)
    if (filter == null) {
      this.missions = this.allMissions;
    } else {
      // On trie les posts selon leur distance de levenshtein
      let levenshteinDist: any = [];
      if (filter.address) {
        for (let mission of this.allMissions) {levenshteinDist.push([mission,getLevenshteinDistance(mission.address.toLowerCase(),filter.address.toLowerCase()),]);}
        levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
        let keys = levenshteinDist.map((key: any) => {return key[0];});
        this.allMissions.sort((a: any, b: any) => keys.indexOf(a) - keys.indexOf(b));
      } 

      // Trie missions selon leurs notifications
      if (filter.sortMissionNotifications === true) {
        let allNotifications = this.store.selectSnapshot(DataQueries.getAll("Notification"));
        let missionsNotifications = allNotifications.map(notification => notification.missions);
        let missionArray = [];
        for (let mission of this.allMissions){
          let missionNotifications = missionsNotifications.map(missionId => missionId === mission.id)
          const countTrue = missionNotifications.filter(value => value === true).length;
          missionArray.push([mission, countTrue]);
        }
        missionArray.sort((a: any, b: any) => b[1] - a[1]);
        let keys = missionArray.map((key: any) => {return key[0]});
        this.allMissions.sort((a: any, b: any) => keys.indexOf(a) - keys.indexOf(b));
      }

      for (let mission of this.allMissions) {

        let isDifferentDate = (filter.date && mission.startDate < filter.date)
        let isDifferentManPower = (filter.manPower && mission.manPower != (filter.manPower === "true"))
        let isNotIncludedJob = (filter.jobs && filter.jobs.length && filter.jobs.every((job: any) => {return job.id != mission.job}))

        if (isDifferentDate || isDifferentManPower || isNotIncludedJob) {continue;}
        this.missions.push(mission);
      }
    }
    this.cd.markForCheck();
  }

  swipeupMenu() {
    this.missionMenu.swipeup = !this.missionMenu.swipeup;
    // toogle activate update
    this.toogle = !this.toogle;
  }

  callBackSwipeup = (b: boolean, type: string): void => {
    if (type == "menu") {
      this.missionMenu.swipeup = b;
    } else {
      this.missionMenu.swipeupCloseMission = b;
    }
  };

  isFilterOn(filter: any){
    if ((filter.address == "" || filter.address == null) && (filter.date == "" || filter.date == null)&& (filter.jobs == null || filter.jobs.length == 0) && filter.manPower == null && (filter.sortDraftDate == false ||filter.sortDraftDate ==  null) && (filter.sortDraftFull == false ||filter.sortDraftFull == null) && (filter.sortMissionNotifications == false || filter.sortMissionNotifications == null)){
      this.filterOn = false;
    } else {
      this.filterOn = true;
      this.info.show("info","Vos filtres ont été appliqués", 3000);
    }
    this.cd.markForCheck;
  }

  changeView(headerActiveView: number) {
    this.view$.subscribe((view)=>{
      if(view=='PME'){
        if (headerActiveView == 0){
          this.filterPME.resetFilter()
          this.searchbar.resetSearch()
          this.filterOn = false;
        }  
        if (headerActiveView == 1) {
          this.filterPME.resetFilter()
          this.searchbar.resetSearch()
          this.filterOn = false;
        }    
        if (headerActiveView == 2) {
          this.filterPME.resetFilter()
          this.searchbar.resetSearch()
          this.filterOn = false;
        }
      }
    })
  }

  callbackFilter = (filter: any): void => {
    switch (this.activeView) {
      case 0:
        this.selectDraft(filter);
        this.isFilterOn(filter);
        break;
      case 1:
        this.selectUserOnline(filter);
        this.isFilterOn(filter);
        break;
      case 2:
        this.selectMission(filter);
        this.isFilterOn(filter);
    }
  };

  selectSearchDraft(searchForm:  string){
    this.userDrafts = [];
    this.allUserDrafts.sort((post1, post2) => {
      let b1 = post1.boostTimestamp > this.time ? 1 : 0;
      let b2 = post2.boostTimestamp > this.time ? 1 : 0;
      return b2 - b1
    });
    if (searchForm == "" || searchForm == null)  {
      this.userDrafts = this.allUserDrafts
    } else {
      let levenshteinDist: any = [];
      for (let post of this.allUserDrafts) {
        let postString = this.searchbar.postToString(post)
        levenshteinDist.push([post,getLevenshteinDistance(postString.toLowerCase(),searchForm.toLowerCase()),]);
      }
      levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
      let keys = levenshteinDist.map((key: any) => { return key[0]; });
      this.allUserDrafts.sort((a: any,b: any)=>keys.indexOf(a) - keys.indexOf(b));
      this.userDrafts = this.allUserDrafts
    }
    this.cd.markForCheck();
  }

  selectSearchOnline(searchForm:  string){
    this.userOnlinePosts.sort((post1, post2) => {
      let b1 = post1.boostTimestamp > this.time ? 1 : 0;
      let b2 = post2.boostTimestamp > this.time ? 1 : 0;
      return b2 - b1
    });

    // Trie Posts selon leurs réponses
    let responses = [];
    for (let post of this.allUserOnlinePosts) {
      const candidatesIds = post.candidates || [],
      candidates = this.store.selectSnapshot(DataQueries.getMany("Candidate", candidatesIds));
      let possCandidate = candidates.reduce((possibleCandidates: Candidate[], candidate: Candidate) => { 
        if (!candidate.isRefused) {possibleCandidates.push(candidate)}
        return possibleCandidates; 
      }, []);
      responses.push([post, possCandidate.length])
    }
    responses.sort((a: any,b: any) => b[1] - a[1]);
    let keys = responses.map((key: any) => { return key[0] });    
    this.allUserOnlinePosts.sort((a: any,b: any)=>keys.indexOf(a) - keys.indexOf(b));
    
    if (searchForm == "" || searchForm == null)  {
    } else {
      let levenshteinDist: any = [];
      for (let post of this.userOnlinePosts) {
        let postString = this.searchbar.postToString(post)
        levenshteinDist.push([post,getLevenshteinDistance(postString.toLowerCase(),searchForm.toLowerCase()),]);
      }
      levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
      let keys = levenshteinDist.map((key: any) => { return key[0]; });
      this.userOnlinePosts.sort((a: any,b: any)=>keys.indexOf(a) - keys.indexOf(b));
    }
    this.cd.markForCheck();
  }

  selectSearchMission(searchForm:  string){
    this.missions = [];
    this.allMissions.sort((a, b) => {return Number(a["isClosed"]) - Number(b["isClosed"]);});
    if (searchForm == "" || searchForm == null)  {
      this.missions = this.allMissions
    } else {
      let levenshteinDist: any = [];
      for (let mission of this.allMissions) {
        let missionString = this.searchbar.missionToString(mission)
        levenshteinDist.push([mission,getLevenshteinDistance(missionString.toLowerCase(),searchForm.toLowerCase()),]);
      }
      levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
      let keys = levenshteinDist.map((key: any) => { return key[0]; });
      this.allMissions.sort((a: any,b: any)=>keys.indexOf(a) - keys.indexOf(b));
      this.missions = this.allMissions
    }
    this.cd.markForCheck();
  }

  selectSearchST(searchForm:  string){
    this.displayOnlinePosts = [];
    const now = new Date().toISOString().slice(0, 10);
     this.allOnlinePosts = this.allOnlinePosts.filter((post) => post.dueDate > now)
    this.allOnlinePosts.sort((post1, post2) => {
      let b1 = post1.boostTimestamp > this.time ? 1 : 0;
      let b2 = post2.boostTimestamp > this.time ? 1 : 0;
      return b2 - b1
    });
    if (searchForm == "" || searchForm == null)  {
      this.displayOnlinePosts = this.allOnlinePosts
    } else {
      let levenshteinDist: any = [];
      for (let post of this.allOnlinePosts) {
        let postString = this.searchbar.postToString(post)
        levenshteinDist.push([post,getLevenshteinDistance(postString.toLowerCase(),searchForm.toLowerCase()),]);
      }
      levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
      let keys = levenshteinDist.map((key: any) => { return key[0]; });
      this.allOnlinePosts.sort((a: any,b: any)=>keys.indexOf(a) - keys.indexOf(b));
      this.displayOnlinePosts = this.allOnlinePosts
    }
    
    this.cd.markForCheck();
  }

  callbackSearch = (searchForm: string): void => {
    switch (this.activeView) {
      case 0:
        this.selectSearchDraft(searchForm)
        break;
      case 1:
        this.selectSearchOnline(searchForm)
        break;
      case 2:
        this.selectSearchMission(searchForm)
    }
  };

  callbackSearchST = (search: string): void => {
    console.log('search', search, !search);
    this.searchBarEmptySubject.next(!search)
    this.refreshSubject.next();
    this.selectSearchST(search)
  }

  searchBarEmptySubject: Subject<boolean> = new Subject<boolean>();
  refreshSubject: Subject<void> = new Subject<void>();
  
  updateFilterOnST(filterOnST: boolean){
    this.refreshSubject.next();
    this.filterOnST = filterOnST;
  }


  //factor two menu into objects
  openDraft(post: Post | null) {
    this.draftMenu = assignCopy(this.draftMenu, { post, open: !!post });
  }

  openPost(post: Post | null, hideExactAdress?: boolean) {
    //mark as viewed
    this.postMenu = assignCopy(this.postMenu, {
      post,
      open: !!post,
      swipeup: false,
      hideExactAdress: hideExactAdress
    });
    if (post) this.store.dispatch(new MarkViewed(post.id));

    // arnaque pour laisser le temps a post de s'update
    setTimeout(() => {
      this.annonceResume.open();
    }, 20);
  }

  setFavorite(fav: any) {
    this.store.dispatch(new SetFavorite(!!fav, this.postMenu.post!.id));
  }

  openMission(mission: Mission | null) {
    let company = this.store.selectSnapshot(DataQueries.currentCompany)
    this.store.dispatch(new PostNotificationViewed(mission!.id, "PME"))
    this.notifService.emitNotifChangeEvent()
    this.missionMenu = assignCopy(this.missionMenu, {
      post: mission,
      open: !!mission,
      swipeup: false,
      swipeupCloseMission: false,
    });
    if (mission?.isClosed && this.missionMenu.open) {
      // setTimeout(()=> this.info.show('error', 'Contract cloturé'), 20)
      this.info.show("error", "Contract cloturé");
    } else this.info.hide();
  }

  duplicatePost(id: number) {
    this.info.show("info", "Duplication en cours...", Infinity);
    this.store
      .dispatch(new DuplicatePost(id))
      .pipe(take(1))
      .subscribe(
        () => {
          this.activeView = 0;
          this.openPost(null);
          this.cd.markForCheck();
        },
        () => {
          this.info.show("error", "Erreur lors de la duplication de l'annonce");
        }
      );
  }

  pausePost(id: number) {
    this.store
      .dispatch(new SwitchPostType(id))
      .pipe(take(1))
      .subscribe(
        () => {
          this.openPost(null);
          this.popup.show({
            type: "template",
            template: this.pausePostTemplate,
          });
          this.cd.markForCheck();
        },
        () => {
          this.info.show("error", "Echec");
        }
      );
  }

  deletePost(id: number) {
    this.store
      .dispatch(new DeletePost(id))
      .pipe(take(1))
      .subscribe(
        () => {
          this.openPost(null);
          this.cd.markForCheck();
        },
        () => {
          this.info.show("error", "Echec de suppression..");
        }
      );
  }

  showUserOffer() {
    this.profile$.pipe(take(1)).subscribe((profile) => {
      this.popup.show({
        type: "template",
        template: this.acceptOfferTemplate,
        context: { $implicit: profile },
      });
    });
  }

  updatePossibleCandidates() {
    const candidatesIds = this.postMenu.post?.candidates || []
    const candidates = this.store.selectSnapshot(
        DataQueries.getMany("Candidate", candidatesIds)
      );
    this.possibleCandidates = candidates.filter((candidate) => {
      return !candidate.isRefused
    })
  }

  showCandidates() {
    this.postMenu.swipeup = false;
    this.swipeupService.show({
      type: "template",
      template: this.candidatesTemplate,
      context: {
        $implicit: this.possibleCandidates,
        job: this.postMenu.post!.job,
      },
    });
  }

  applyPost(post: Post, form: ApplyForm) {
    this.info.show("info", "Candidature en cours...", Infinity);
    this.store
      .dispatch(new ApplyPost(post.id, form))
      .pipe(take(1))
      .subscribe(
        (success) => {
          // Si la candidature est envoyée on quite la vue de la candidature
          this.updateAllOnlinePost(post)
          this.slideOnlinePostClose();
        },
        (error) =>
          this.info.show("error", "Echec de l'envoi de la candidature", 5000)
      );
  }

  validateCandidate(post: Post, candidateId: number){
    this.store
    .dispatch(new HandleApplication(candidateId, post, true))
    .pipe(take(1))
    .subscribe(() => {
      //if successful, quit the slidemenu
      this.openPost(null);
      this.cd.markForCheck();
    });
  }

  refuseCandidate(post: Post, candidateId: number){
    this.store
      .dispatch(new HandleApplication(candidateId, post, false))
      .pipe(take(1))
      .subscribe(() => {
        this.openPost(null);
        this.cd.markForCheck();
      });
  }

  blockCandidate(candidateId: number){
    let candidate = this.store.selectSnapshot(DataQueries.getById('Candidate', candidateId))     
    this.store
      .dispatch(new BlockCompany(candidate!.company, true))
      .pipe(take(1))
      .subscribe(() => {

        this.slideService.hide()
        this.openPost(null);
        // this.slideOnlinePost.close();
        // this.slideOnlinePostClose()
        // this.router.navigateByUrl('/home')
        this.cd.markForCheck();
      });
  }

  handleApplication(post: Post, candidateId: number) {
    this.swipeupService.show({
      type: "menu",
      hideOnClick: true,
      items: [
        {
          name: "Valider la candidature",
          class: "validate application-response",
          click: () => {
            this.popup.validateCandidate(candidateId, post, this)
          },
        },
        {
          name: "Refuser la candidature",
          class: "reject application-response",
          click: () => {
            this.popup.refuseCandidate(candidateId, post, this)
          },
        },
        {
          name: "Bloquer le contact",
          class: "block application-response",
          click: () => {
            this.popup.blockCandidate(candidateId, this)
          }
        },
      ],
    });
  }

  showCompany(companyId: number, application: number) {
    //postMenu is still open
    const candidate = this.store.selectSnapshot(
      DataQueries.getById("Candidate", application)
    );
    const company = this.store.selectSnapshot(
      DataQueries.getById("Company", companyId)
    );
    const user = { firstName: candidate!.contact, lastName: "" } as unknown;
    this.profileSubContractor = {
      user: user as User,
      company: company!,
    } as Profile;
    this.amountSubContractor = candidate?.amount
      ? "Contre-Offre: " + candidate!.amount.toString() + " €"
      : null;
    this.store
      .dispatch(new CandidateViewed(application))
      .pipe(take(1))
      .subscribe(() => {});
    this.slideService.show("Candidature", {
      type: "template",
      template: this.candidature,
      context: {
        $implicit: companyId,
        application,
        post: this.postMenu.post,
      },
    });

    this.swipeupService.hide();
  }

  @ViewChild(UIAnnonceResume, { static: false })
  private annonceResume!: UIAnnonceResume;

  @ViewChild("slideOnlinePost") private slideOnlinePost!: UISlideMenuComponent;

  slideOnlinePostClose() {
    this.updatePage()
    // Close View
    this.slideOnlinePost.close();

    // reset searchbar
    this.searchbar.resetSearch()

    // reset filter PME
    this.view$.subscribe((view)=>{
      if(view=='PME'){
        this.filterPME.resetFilter()
        this.filterOn = false;
    }})

    this.view$.subscribe((view)=>{
      if(view=='ST'){
        this.filterST.updateFilteredPosts(this.filterST.filterForm.value)
        this.filterST.updateEvent.emit(this.filterST.filteredPosts);
        this.filterService.emitFilterChangeEvent(this.filterST.filteredPosts)
    }})

    // Update
    this.annonceResume.close();
  }

  @ViewChild("slideMission") private slideMission!: UISlideMenuComponent;

  slideMissionClose() {
    this.cd.markForCheck()
    // Close View
    this.slideMission.close();

    // reset searchbar
    this.searchbar.resetSearch()
    this.filterPME.resetFilter()
    this.filterOn = false;
  
  }

  // Notifications in header /////
  currentPost?: Post;

  updateCurrentPost(p: Post) {
    this.currentPost = p;
  }
  // Used in notification
  get currentCandidates(): number {
    let possibleCandidates: number = 0;
    if (this.currentPost) {
      const candidatesIds = this.currentPost!.candidates || [],
        candidates = this.store.selectSnapshot(
          DataQueries.getMany("Candidate", candidatesIds)
        );
      candidates.forEach((candidate) => {
        if (!candidate.isRefused && !candidate.isViewed) possibleCandidates++;
      });
    }
    return possibleCandidates;
  }

  slideBooster(){
    this.postMenu.swipeup = false;
    this.slideService.show("Booster", {
      type: "template",
      template: this.boosterTemplate,
      context: {
        $implicit: this.postMenu.post,
      },
    });
  }

  updateAllOnlinePost(post: Post) {
    post = this.store.selectSnapshot(DataQueries.getById("Post", post.id))!
    let temporaryAllOnlinePost: Post[] = []
    let oldPost: Post | undefined = this.allOnlinePosts.pop()
    let checkIf = true
    this.allOnlinePosts.forEach((onlinePost: Post) => {
      if (onlinePost.id > oldPost!.id && checkIf){
        temporaryAllOnlinePost.push(post)
        checkIf = false
      }
      temporaryAllOnlinePost.push(onlinePost)
    })
    this.allOnlinePosts = temporaryAllOnlinePost
    this.filterST.updatePosts(this.allOnlinePosts);
  }

  closeAdFilterMenu(value: any){
    this.openAdFilterMenu = value;
    this.view$.subscribe((view)=>{
      if(view=='ST'){
        this.filterST.updateFilteredPosts(this.filterST.filterForm.value);
        this.displayOnlinePosts = this.filterST.filteredPosts;
        this.filterST.isFilterOn(this.filterST.filterForm.value);
      }
    })
    this.cd.markForCheck();
  }    
}
