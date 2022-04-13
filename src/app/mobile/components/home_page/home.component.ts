import { Component, ChangeDetectionStrategy, SimpleChange, SimpleChanges, ViewChild, TemplateRef, ChangeDetectorRef, Input } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { combineLatest, Observable } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { DistanceSliderConfig, SalarySliderConfig } from "src/app/shared/common/config";
import { assignCopy, splitByOutput } from "src/app/shared/common/functions";
import { InfoService } from "src/app/shared/components/info/info.component";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { SlidemenuService } from "src/app/shared/components/slidemenu/slidemenu.component";
import { SwipeupService } from "src/app/shared/components/swipeup/swipeup.component";
import { ApplyPost, DeletePost, DuplicatePost, HandleApplication, MarkViewed, SetFavorite, SwitchPostType } from "src/models/new/user/user.actions";
import { DataQueries, DataState, QueryAll } from 'src/models/new/data.state';
import { Profile, Post, Mission, PostMenu, Candidate } from "src/models/new/data.interfaces";
import { FilterService } from "src/app/shared/services/filter.service";
import { ApplyForm } from "../../ui/annonce-resume/annonce-resume.ui";

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent extends Destroy$ {
  
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
    console.log("mission to close", this.missions, this.missions[0])
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

  constructor(
    private cd: ChangeDetectorRef, private store: Store,
    private info: InfoService, private popup: PopupService, private swipeupService: SwipeupService, private slideService: SlidemenuService,
    private filters: FilterService
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
    
  }

  ngOnDestroy(): void {
    this.info.alignWith('last');
    super.ngOnDestroy();
  }

  ngAfterViewInit() {
    this.filters.filter('ST', this.allOnlinePosts);
  }

  ngOnChanges() {
    console.log("change home component")
  }

  get openCloseMission() {return this._openCloseMission}
  set openCloseMission(b:boolean) {
    console.log("openCloseMission", b)
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
    if ( post )
      this.store.dispatch(new MarkViewed(post.id));
  }

  setFavorite(fav: any) {
    this.store.dispatch(new SetFavorite(!!fav, this.postMenu.post!.id));
  }

  openMission(mission: Mission | null) {
    this.missionMenu = assignCopy(this.missionMenu, {post: mission, open: !!mission, swipeup: false, swipeupCloseMission: false});
    if (mission?.isClosed && this.missionMenu.open) this.info.show('error', 'Contract cloturé')
    else this.info.hide()
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
        success => this.info.show("success", "Candidature envoyée", 2000),
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

  showCompany(company: number, application: number) {
    //postMenu is still open
    this.slideService.show('Candidature', {
      type: 'template',
      template: this.candidature,
      context: {
        $implicit: company,
        application,
        post: this.postMenu.post
      }
    });

    this.swipeupService.hide();
  }
};