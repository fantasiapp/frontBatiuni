import { Component, ChangeDetectionStrategy, SimpleChange, SimpleChanges, ViewChild, TemplateRef, ChangeDetectorRef } from "@angular/core";
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
import { ApplyPost, DeletePost, DuplicatePost, HandleApplication, SwitchPostType } from "src/models/new/user/user.actions";
import { DataQueries, DataState, QueryAll, SnapshotAll } from 'src/models/new/data.state';
import { Profile, Post, Mission } from "src/models/new/data.interfaces";

class PostMenu<T extends Post | Mission = Post> {
  open: boolean = false;
  post: T | null = null;
  swipeup: boolean = false;

  get candidates() { return this.post?.candidates || []; }
};

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


  @ViewChild('pausePostTemplate', {read: TemplateRef, static: true})
  pausePostTemplate!: TemplateRef<any>;

  @ViewChild('acceptOffer', {read: TemplateRef, static: true})
  acceptOfferTemplate!: TemplateRef<any>;

  @ViewChild('candidates', {read: TemplateRef, static: true})
  candidatesTemplate!: TemplateRef<any>;

  @ViewChild('candidature', {read: TemplateRef, static: true})
  candidature!: TemplateRef<any>;

  constructor(private cd: ChangeDetectorRef, private store: Store, private info: InfoService, private popup: PopupService, private swipeupService: SwipeupService, private slideService: SlidemenuService) {
    super();
  }
  
  ngOnInit() {
    combineLatest([this.profile$, this.posts$]).pipe(takeUntil(this.destroy$)).subscribe(([profile, posts]) => {
      const mapping = splitByOutput(posts, (post) => {
        //0 -> userOnlinePosts | 1 -> userDrafts
        if ( profile.company.posts.includes(post.id) )
          return post.draft ? this.symbols.userDraft : this.symbols.userOnlinePost; 
        
        return post.draft ? this.symbols.discard : this.symbols.otherOnlinePost;
      });

      this.userDrafts = mapping.get(this.symbols.userDraft) || [];
      this.userOnlinePosts = mapping.get(this.symbols.userOnlinePost) || [];
      this.allOnlinePosts = mapping.get(this.symbols.otherOnlinePost) || [];
      this.missions = this.store.selectSnapshot(DataQueries.getMany('Mission', profile.company.missions));
      this.cd.markForCheck();
    });
  }
  activeView: number = 0;
  openAdFilterMenu: boolean = false;
  imports = { DistanceSliderConfig, SalarySliderConfig };
  draftMenu = new PostMenu;
  postMenu = new PostMenu;
  missionMenu = new PostMenu<Mission>();
  
  //factor two menu into objects
  openDraft(post: Post | null) {
    this.info.hide();
    this.draftMenu = assignCopy(this.draftMenu, {post, open: !!post});
  }
  
  openPost(post: Post | null) {
    this.info.hide();
    this.postMenu = assignCopy(this.postMenu, {post, open: !!post, swipeup: false});
  }

  openMission(mission: Mission | null) {
    this.info.hide();
    this.missionMenu = assignCopy(this.missionMenu, {post: mission, open: !!mission, swipeup: false});
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
      this.popup.show(this.pausePostTemplate);
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
      this.popup.show(this.acceptOfferTemplate, {
        $implicit: profile
      })
    });
  }

  showCandidates() {
    this.postMenu.swipeup = false;
    const candidatesIds = this.postMenu.post?.candidates || [],
      candidates = this.store.selectSnapshot(DataQueries.getMany('Candidate', candidatesIds));

    this.swipeupService.show({
      type: 'template',
      template: this.candidatesTemplate,
      context: {
        $implicit: candidates,
        job: this.postMenu.post!.job,
      }
    })
  }

  applyPost(post: Post) {
    this.info.show("info", "Candidature en cours...", Infinity);
    this.store.dispatch(new ApplyPost(post.id)).pipe(take(1))
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