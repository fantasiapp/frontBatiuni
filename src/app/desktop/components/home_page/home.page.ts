import { animate, style, transition, trigger } from "@angular/animations";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { take } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { filterSplit } from "src/app/shared/common/functions";
import { Serialized } from "src/app/shared/common/types";
import { InfoService } from "src/app/shared/components/info/info.component";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { Company, CompanyRow, Post, PostRow } from "src/models/data/data.model";
import { DataState } from "src/models/data/data.state";
import { ApplyPost, DeletePost, SwitchPostType } from "src/models/user/user.actions";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";
type PostMenu = { open: boolean; post: Post | null; };

type resumerType = 'enligne' | 'valider';

@Component({
  selector: 'home',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateX(-100%)', opacity: 0}),
          animate('300ms', style({transform: 'translateX(0)', opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateX(0)', opacity: 1}),
          animate('200ms', style({transform: 'translateX(-100%)', opacity: 0}))
        ])
      ]
    )
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent extends Destroy$ {


  @ViewChild('testTemplate', { read: TemplateRef, static: true })
  testTemplate!: TemplateRef<any>;

  @Select(UserState)
  user$!: Observable<User>;

  @Select(DataState.get('posts'))
  posts$!: Observable<Post[]>;

  constructor(private cd: ChangeDetectorRef, private store: Store, private info: InfoService, private popup: PopupService) {
    super()
  }
  // Resumer d'annonce ------->
  candidate: any;
  candidateData: CompanyRow[] | undefined;
  showPostResumer(post: Post, type: resumerType) {
    this.resumerType = type;
    this.showValidePost = true
    this.postResumer = PostRow.getById(+post.id).serialize();
    this.companyResumer = this.postResumer ? PostRow.getCompany(this.postResumer) : null;
    const candidate = this.userOnlinePosts.filter(chosen => chosen.id === post.id)
    this.candidate = candidate.map(user => user.candidates)
    this.candidateData = (this.candidate[0] || []).map((user: any) => {
      return CompanyRow.getById(user.company).serialize()
    })
  }
  resumerType!: resumerType;
  companyResumer: Company | null = null;
  postResumer!: Post;
  // END RESUMER D'ANNONCE

  viewPostLength() {
    let length = 0;
    if (this.activeView == 0) length = this.userDrafts.length
    if (this.activeView == 1) length = this.userOnlinePosts.length
    return length
  }
  showValidePost: boolean = false;
  userPosts: Post[] = [];
  userDrafts: Post[] = [];
  userOnlinePosts: Post[] = [];

  allOnlinePosts: Post[] = [];

  checkMenu: PostMenu & { swipeup: boolean; } = { open: false, post: null, swipeup: false }

  activeView: number = 0;
  annonces = new Array(10).fill(0);
  editMenu: PostMenu = { open: false, post: null };

  getDrafts(user: User) { return user.profile?.company.posts.filter(post => post.draft); }

  openPost(post: Serialized<PostRow>) {
    this.editMenu = { open: true, post };
  }

  ngOnInit() {
    combineLatest([this.user$, this.posts$]).subscribe(([user, posts]) => {
      this.userPosts = user.profile?.company.posts || [];
      [this.userOnlinePosts, this.userDrafts] = filterSplit(this.userPosts, post => !post.draft);
      const userOnlinePostsIds = this.userOnlinePosts.map(onlinePost => onlinePost.id);

      this.allOnlinePosts = posts.filter(post => !post.draft).filter(post => !userOnlinePostsIds.includes(post.id));
      console.log(this.allOnlinePosts)
      this.userOnlinePosts.reverse();
      this.userDrafts.reverse();
    });
  }

  switchDraft(id: number) {
    this.store.dispatch(new SwitchPostType(id)).pipe(take(1)).subscribe(() => {
      this.checkMenu = { open: false, post: null, swipeup: false };
    }, () => {
      this.info.show("error", "Echec");
    });
  }

  deletePost(id: number) {
    this.store.dispatch(new DeletePost(id)).pipe(take(1)).subscribe(() => {
      this.checkMenu = { open: false, post: null, swipeup: false };
    }, () => {
      this.info.show("error", 'Echec de suppression..');
    });
  }

  applyPost(post: Post) {
    this.info.show("info", "Candidature en cours...", Infinity);
    this.store.dispatch(new ApplyPost(post.id)).pipe(take(1))
      .subscribe(
        success => this.info.show("success", "Candidature envoyée", 2000),
        error => {
          this.info.show("error", "Echec de l'envoi de la candidature", 5000);
        }
      );
  }
  devis = ['Par Heure', 'Par Jour', 'Par Semaine'].map((name, id) => ({ id, name }));
  devisForm = new FormGroup({
    amount: new FormControl(0),
    devis: new FormControl([{ id: 0 }])
  });

  testPopup() {
    this.popup.show(this.testTemplate);
    console.log(this.testTemplate)
    this.cd.markForCheck();
  }
  showFilters: boolean = false;
  
};
// function to add two numbers