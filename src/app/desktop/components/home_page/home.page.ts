import { animate, style, transition, trigger } from "@angular/animations";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { splitByOutput } from "src/app/shared/common/functions";
import { InfoService } from "src/app/shared/components/info/info.component";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { ApplyPost, DeletePost, SwitchPostType } from "src/models/user/user.actions";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";
import { DataQueries, DataState, QueryAll, Snapshot, SnapshotArray } from 'src/models/new/data.state'
import { Candidate, Company, File, Job, Post, Profile } from "src/models/new/data.interfaces";
import { PostDetail } from "src/models/data/data.model";

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

  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  @Select(UserState)
  user$!: Observable<User>;

  @Select(DataState.view)
  view$!: Observable<"ST" | "PME">;

  @QueryAll('Post')
  posts$!: Observable<Post[]>;

  //split the set all of posts into these (what we need)
  private symbols = {
    userDraft: 0, userOnlinePost: 1,
    otherOnlinePost: 2, discard: -1
  };

  constructor(private cd: ChangeDetectorRef, private store: Store, private info: InfoService, private popup: PopupService) {
    super()
  }

  @Snapshot('Job') postResumerJob!: number | Job;
  @SnapshotArray('Candidate') postResumerCandidates!: number[] | Candidate[];
  @SnapshotArray('DetailedPost') postResumerDetails!: number[] | PostDetail[];
  @SnapshotArray('File') postResumerFiles!: number[] | File[];

  showPostResumer(post: Post, type: resumerType) {
    this.resumerType = type;
    this.showValidePost = true
    this.postResumer = post;
    this.postResumerJob = post.job;
    this.postResumerCandidates = post.candidates;
    this.postResumerDetails = post.details;
    this.postResumerFiles = post.files;
    // const candidate = this.userOnlinePosts.filter(chosen => chosen.id === post.id)
    // this.candidate = candidate.map(user => user.candidates)
    // this.candidateData = (this.candidate[0] || []).map((user: any) => {
    //   return CompanyRow.getById(user.company).serialize()
    // })
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

  ngOnInit() {
    combineLatest([this.profile$, this.posts$]).pipe(takeUntil(this.destroy$)).subscribe(([profile, posts]) => {
      console.log('Profile', profile, 'post', posts)
      const mapping = splitByOutput(posts, (post) => {
        //0 -> userOnlinePosts | 1 -> userDrafts
        if ( profile.company.posts.includes(post.id) )
          return post.draft ? this.symbols.userDraft : this.symbols.userOnlinePost; 
        
        return post.draft ? this.symbols.discard : this.symbols.otherOnlinePost;
      });

      this.userDrafts = mapping.get(this.symbols.userDraft) || [];
      this.userOnlinePosts = mapping.get(this.symbols.userOnlinePost) || [];
      this.allOnlinePosts = mapping.get(this.symbols.otherOnlinePost) || [];
      console.log(this.allOnlinePosts)
    });
    console.log(this.postResumerCandidates)
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