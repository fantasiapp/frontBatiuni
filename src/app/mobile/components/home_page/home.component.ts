import { Component, ChangeDetectionStrategy, SimpleChange, SimpleChanges, ViewChild, TemplateRef, ChangeDetectorRef, Input, EventEmitter, Output, HostBinding } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { combineLatest, Observable, Subject } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { DistanceSliderConfig, SalarySliderConfig } from "src/app/shared/common/config";
import { assignCopy, splitByOutput } from "src/app/shared/common/functions";
import { InfoService } from "src/app/shared/components/info/info.component";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { SlidemenuService, UISlideMenuComponent } from "src/app/shared/components/slidemenu/slidemenu.component";
import { SwipeupService } from "src/app/shared/components/swipeup/swipeup.component";
import { ApplyPost, CandidateViewed, DeletePost, DownloadFile, DuplicatePost, HandleApplication, MarkViewed, SetFavorite, SwitchPostType } from "src/models/new/user/user.actions";
import { DataQueries, DataState, QueryAll } from 'src/models/new/data.state';
import { Profile, Post, Mission, PostMenu, Candidate, User } from "src/models/new/data.interfaces";
import { FilterService } from "src/app/shared/services/filter.service";
import { ApplyForm, UIAnnonceResume } from "../../ui/annonce-resume/annonce-resume.ui";
import { Mobile } from "src/app/shared/services/mobile-footer.service";

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent extends Destroy$ {

  profileSubContractor:Profile | null = null
  amountSubContractor:String | null = null
  
  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  @Select(DataState.view)
  view$!: Observable<"PME" | "ST">;

  @QueryAll('Post')
  posts$!: Observable<Post[]>;

  //split the set all of posts into these (what we need)
  private symbols = {
    userDraft: 0, userOnlinePost: 1,
    otherOnlinePost: 2, discard: -1
  };

  userDrafts: Post[] = [];
  userOnlinePosts: Post[] = [];
  allOnlinePosts: Post[] = [];
  missions: Mission[] = [];

  get missionToClose () {
    return this.missions[0]
  }


  @ViewChild('pausePostTemplate', {read: TemplateRef, static: true})
  pausePostTemplate!: TemplateRef<any>;

  @ViewChild('acceptOffer', {read: TemplateRef, static: true})
  acceptOfferTemplate!: TemplateRef<any>;

  @ViewChild('candidates', {read: TemplateRef, static: true})
  candidatesTemplate!: TemplateRef<any>;

  @ViewChild('candidature', {read: TemplateRef, static: true})
  candidature!: TemplateRef<any>;

  @ViewChild('suiviPME', {read: TemplateRef, static: true})
  suiviChantier!: TemplateRef<any>;

  activeView: number = 0;
  _openCloseMission: boolean = false
  openAdFilterMenu: boolean = false
  toogle:boolean = false
  imports = { DistanceSliderConfig, SalarySliderConfig }
  draftMenu = new PostMenu
  postMenu = new PostMenu
  missionMenu = new PostMenu<Mission>()

  showFooter: boolean = true
  @HostBinding('class.footerHide') get footer(){return this.showFooter}


  constructor(
    private cd: ChangeDetectorRef, private store: Store,
    private info: InfoService, private popup: PopupService, private swipeupService: SwipeupService, private slideService: SlidemenuService,
    private filters: FilterService, private mobile: Mobile
  ) {
    super();

    
  }
  
  ngOnInit() {
    this.info.alignWith('header_search');
    combineLatest([this.profile$, this.posts$]).pipe(takeUntil(this.destroy$)).subscribe(([profile, posts]) => {
      const mapping = splitByOutput(posts, (post) => {
        //0 -> userOnlinePosts | 1 -> userDrafts
        if ( profile.company.posts.includes(post.id) )
          return post.draft ? this.symbols.userDraft : this.symbols.userOnlinePost; 
        
        return post.draft ? this.symbols.discard : this.symbols.otherOnlinePost;
      });

      const otherOnlinePost = (mapping.get(this.symbols.otherOnlinePost) || []);
      this.userDrafts = mapping.get(this.symbols.userDraft) || [];
      this.userOnlinePosts = mapping.get(this.symbols.userOnlinePost) || [];
      this.allOnlinePosts = [...otherOnlinePost, ...this.userOnlinePosts];
      this.missions = this.store.selectSnapshot(DataQueries.getMany('Mission', profile.company.missions));
      this.cd.markForCheck();
    });
    // const view = this.store.selectSnapshot(DataState.view)
    // this._openCloseMission = view == 'ST' && this.missions.length != 0
    // console.log("ngOnInit", view, this.missions, this._openCloseMission)
    
    this.mobile.footerStateSubject.subscribe(b => {
      this.showFooter = b
      this.cd.detectChanges()
    })

  }

  ngOnDestroy(): void {
    this.info.alignWith('last');
    super.ngOnDestroy();
  }

  ngAfterViewInit() {
    this.filters.filter('ST', this.allOnlinePosts);
  }

  get openCloseMission() {return this._openCloseMission}
  set openCloseMission(b:boolean) {
    this._openCloseMission = !this._openCloseMission
  }


  swipeupMenu() {
    this.missionMenu.swipeup = !this.missionMenu.swipeup
    // toogle activate update
    this.toogle = !this.toogle
  }

  callBackSwipeup = (b:boolean, type:string): void => {
    if (type == "menu") { this.missionMenu.swipeup = b }
    else {this.missionMenu.swipeupCloseMission = b}
  }

  //factor two menu into objects
  openDraft(post: Post | null) {
    this.draftMenu = assignCopy(this.draftMenu, {post, open: !!post});
  }
  
  openPost(post: Post | null) {
    //mark as viewed
    this.postMenu = assignCopy(this.postMenu, {post, open: !!post, swipeup: false});
    if ( post ) this.store.dispatch(new MarkViewed(post.id));

    // arnaque pour laisser le temps a post de s'update
    setTimeout(()=>{
      this.annonceResume.open()
    },20)
  }

  setFavorite(fav: any) {
    this.store.dispatch(new SetFavorite(!!fav, this.postMenu.post!.id));
  }

  openMission(mission: Mission | null) {
    this.missionMenu = assignCopy(this.missionMenu, {post: mission, open: !!mission, swipeup: false, swipeupCloseMission: false});
    if (mission?.isClosed && this.missionMenu.open) {
      // setTimeout(()=> this.info.show('error', 'Contract cloturé'), 20)
      this.info.show('error', 'Contract cloturé')
    } else this.info.hide()
  }

  duplicatePost(id: number) {
    this.info.show("info", "Duplication en cours...", Infinity);
    this.store.dispatch(new DuplicatePost(id)).pipe(take(1)).subscribe(() => {
      this.openPost(null);
      this.cd.markForCheck();
    }, () => {
      this.info.show("error", "Erreur lors de la duplication de l'annonce");
    });
  }

  pausePost(id: number) {
    this.store.dispatch(new SwitchPostType(id)).pipe(take(1)).subscribe(() => {
      this.openPost(null);
      this.popup.show({
        type: 'template',
        template: this.pausePostTemplate
      });
      this.cd.markForCheck();
    }, () => {
      this.info.show("error", "Echec");
    });
  }
  
  deletePost(id: number) {
    this.store.dispatch(new DeletePost(id)).pipe(take(1)).subscribe(() => {
      this.openPost(null);
      this.cd.markForCheck();
    }, () => {
      this.info.show("error", 'Echec de suppression..');
    });
  }

  showUserOffer() {
    this.profile$.pipe(take(1)).subscribe(profile => {
      this.popup.show({
        type: 'template',
        template: this.acceptOfferTemplate,
        context: {$implicit: profile}
      })
    });
  }

  get possibleCandidates() {
    const candidatesIds = this.postMenu.post?.candidates || [],
      candidates = this.store.selectSnapshot(DataQueries.getMany('Candidate', candidatesIds));
    return candidates.reduce((possibleCandidates:Candidate[], candidate:Candidate) => {
      if (!candidate.isRefused) {
        possibleCandidates.push(candidate)
      }
      return possibleCandidates;
    }, [])
  }

  showCandidates() {
    this.postMenu.swipeup = false;
    this.swipeupService.show({
      type: 'template',
      template: this.candidatesTemplate,
      context: {
        $implicit: this.possibleCandidates,
        job: this.postMenu.post!.job,
      }
    })
  }

  applyPost(post: Post, form: ApplyForm) {
    this.info.show("info", "Candidature en cours...", Infinity);
    this.store.dispatch(new ApplyPost(post.id, form)).pipe(take(1))
      .subscribe(
        success => {
          this.info.show("success", "Candidature envoyée", 2000)

          // Si la candidature est envoyée on quite la vue de la candidature
          this.slideOnlinePostClose()
        },
        error => this.info.show("error", "Echec de l'envoi de la candidature", 5000)
      ); 
    
      
  }

  handleApplication(post: Post, application: number) {
    this.swipeupService.show({
      type: 'menu',
      hideOnClick: true,
      items: [{
        name: 'Valider la candidature',
        class: 'validate application-response',
        click: () => {
          console.log('valider la candidature');
          this.store.dispatch(new HandleApplication(application, post, true)).pipe(take(1)).subscribe(() => {
            //if successful, quit the slidemenu
            this.openPost(null);
            this.cd.markForCheck();
          });
        }
      }, {
        name: 'Refuser la candidature',
        class: 'reject application-response',
        click: () => {
          this.store.dispatch(new HandleApplication(application, post, false)).pipe(take(1)).subscribe(() => {
            console.log('refuser la candidature');
            this.openPost(null);
            this.cd.markForCheck();  
          });
        }
      }, {
        name: 'Bloquer le contact',
        class: 'block application-response',
        click: () => this.info.show('info', 'En developpement', 2000)
      }]
    })
  }

  showCompany(companyId: number, application: number) {
    //postMenu is still open
    const candidate = this.store.selectSnapshot(DataQueries.getById('Candidate', application))
    const company = this.store.selectSnapshot(DataQueries.getById('Company', companyId))
    const user =  {firstName:candidate!.contact, lastName:''} as unknown
    this.profileSubContractor={user:user as User, company:company!} as Profile
    this.amountSubContractor = candidate?.amount ? "Contre-Offre: " +candidate!.amount.toString() + " €"  : null
    console.log("to declare viewed")
    this.store.dispatch(new CandidateViewed(application)).pipe(take(1)).subscribe(() => {})
    this.slideService.show('Candidature', {
      type: 'template',
      template: this.candidature,
      context: {
        $implicit: companyId,
        application,
        post: this.postMenu.post
      }
    });

    this.swipeupService.hide();
  }

  @ViewChild(UIAnnonceResume, {static: false})
  private annonceResume!: UIAnnonceResume;

  @ViewChild('slideOnlinePost') private slideOnlinePost!: UISlideMenuComponent;

  slideOnlinePostClose(){
    // Close View
    this.slideOnlinePost.close()

    // Update
    this.annonceResume.close()
  }

  
  // Notifications in header /////
  currentPost?: Post;
  
  updateCurrentPost(p: Post) {
    this.currentPost = p;
  }
  // Used in notification
  get currentCandidates(): number{
    let possibleCandidates:number = 0
    if (this.currentPost) {
      const candidatesIds = this.currentPost!.candidates || [],
        candidates = this.store.selectSnapshot(DataQueries.getMany('Candidate', candidatesIds))
        candidates.forEach((candidate) => {
          if (!candidate.isRefused && !candidate.isViewed) possibleCandidates++
        })
    }
    return possibleCandidates
  }
};