import { Component, ChangeDetectionStrategy, SimpleChange, SimpleChanges, ViewChild, TemplateRef, ChangeDetectorRef } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Select, Store } from "@ngxs/store";
import { combineLatest, Observable } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { DistanceSliderConfig, SalarySliderConfig } from "src/app/shared/common/config";
import { filterSplit } from "src/app/shared/common/functions";
import { InfoService } from "src/app/shared/components/info/info.component";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { ProfileCardComponent } from "src/app/shared/components/profile-card/profile.card";
import { SlidemenuService } from "src/app/shared/components/slidemenu/slidemenu.component";
import { SwipeupService } from "src/app/shared/components/swipeup/swipeup.component";
import { Company, Post, PostRow } from "src/models/data/data.model";
import { DataState } from "src/models/data/data.state";
import { ApplyPost, DeletePost, DuplicatePost, SwitchPostType } from "src/models/user/user.actions";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";
type PostMenu = { open: boolean; post: Post | null; };
@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent extends Destroy$ {
  @Select(UserState)
  user$!: Observable<User>;

  @Select(DataState.get('posts'))
  posts$!: Observable<Post[]>;

  @ViewChild('pausePostTemplate', {read: TemplateRef, static: true})
  pausePostTemplate!: TemplateRef<any>;

  @ViewChild('acceptOffer', {read: TemplateRef, static: true})
  acceptOfferTemplate!: TemplateRef<any>;

  @ViewChild('candidates', {read: TemplateRef, static: true})
  candidatesTemplate!: TemplateRef<any>;

  constructor(private cd: ChangeDetectorRef, private store: Store, private info: InfoService, private popup: PopupService, private swipeupService: SwipeupService) {
    super()
  }

  userPosts: Post[] = [];
  userDrafts: Post[] = [];
  userOnlinePosts: Post[] = [];
  allOnlinePosts: Post[] = [];

  
  ngOnInit() {
    combineLatest([this.user$, this.posts$]).pipe(takeUntil(this.destroy$)).subscribe(([user, posts]) => {
      this.userPosts = user.profile?.company.posts || [];
      [this.userOnlinePosts, this.userDrafts] = filterSplit(this.userPosts, post => !post.draft);
      
      const userOnlinePostsIds = this.userOnlinePosts.map(onlinePost => onlinePost.id);
      this.allOnlinePosts = posts.filter(post => !post.draft).filter(post => !userOnlinePostsIds.includes(post.id));
    });
  }
  activeView: number = 0;
  validerCandidature: boolean = false;
  openReponseMenu : boolean = false;
  annonces = new Array(10);
  openAdFilterMenu: boolean = false;
  imports = { DistanceSliderConfig, SalarySliderConfig };
  editMenu: PostMenu = { open: false, post: null };
  checkMenu: PostMenu & { swipeup: boolean; } = { open: false, post: null, swipeup: false }
  
  openPost(post: Post) {
    this.info.hide();
    this.editMenu = { open: true, post };
  }
  
  checkPost(post: Post) {
    this.info.hide();
    this.checkMenu = { open: true, post, swipeup: false };
  }

  checkPostMenu() {
    this.info.hide();
    this.checkMenu.swipeup = true;
  }

  duplicatePost(id: number) {
    this.info.show("info", "Duplication en cours...", Infinity);
    this.store.dispatch(new DuplicatePost(id)).pipe(take(1)).subscribe(() => {
      this.checkMenu = {open: false, post: null, swipeup: false};
      this.info.hide();
      this.cd.markForCheck();
    }, () => {
      this.info.show("error", "Erreur lors de la duplication de l'annonce");
    });
  }

  pausePost(id: number) {
    this.info.show("info", "En cours...", Infinity);
    this.store.dispatch(new SwitchPostType(id)).pipe(take(1)).subscribe(() => {
      this.checkMenu = {open: false, post: null, swipeup: false};
      this.popup.show(this.pausePostTemplate);
      this.info.hide();
      this.cd.markForCheck();
    }, () => {
      this.info.show("error", "Echec");
    });
  }
  
  deletePost(id: number) {
    this.store.dispatch(new DeletePost(id)).pipe(take(1)).subscribe(() => {
      this.checkMenu = {open: false, post: null, swipeup: false};
      this.cd.markForCheck();
    }, () => {
      this.info.show("error", 'Echec de suppression..');
    });
  }

  showUserOffer() {
    let user  = this.store.selectSnapshot(UserState)
    this.popup.show(this.acceptOfferTemplate, {
      $implicit: user
    })
  }

  showCandidates() {
    const candidates = (this.checkMenu.post?.candidates || []).map(({company}) => company);
    this.checkMenu.swipeup = false;
    this.swipeupService.show({
      type: 'template',
      template: this.candidatesTemplate,
      context: {
        $implicit: candidates,
        job: this.checkMenu.post!.job
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

  devis = ['Par Heure', 'Par Jour', 'Par Semaine'].map((name, id) => ({id, name}));
  form = new FormGroup({
    amount: new FormControl(0),
    devis: new FormControl([{id: 0}])
  });
};