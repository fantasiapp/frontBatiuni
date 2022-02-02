import { Component, ChangeDetectionStrategy, SimpleChange, SimpleChanges } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { DistanceSliderConfig, SalarySliderConfig } from "src/app/shared/common/config";
import { filterSplit } from "src/app/shared/common/functions";
import { Serialized } from "src/app/shared/common/types";
import { InfoService } from "src/app/shared/components/info/info.component";
import { Company, Post, PostRow } from "src/models/data/data.model";
import { DataState } from "src/models/data/data.state";
import { DeletePost, DuplicatePost, SwitchPostType } from "src/models/user/user.actions";
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

  constructor(private store: Store, private info: InfoService) {
    super()
  }

  userPosts: Post[] = [];
  userDrafts: Post[] = [];
  userOnlinePosts: Post[] = [];
  allOnlinePosts: [Post, Company][] = [];

  
  ngOnInit() {
    combineLatest([this.user$, this.posts$]).pipe(takeUntil(this.destroy$)).subscribe(([user, posts]) => {
      this.userPosts = user.profile?.company.posts || [];
      [this.userOnlinePosts, this.userDrafts] = filterSplit(this.userPosts, post => !post.draft);
      
      this.allOnlinePosts = posts.filter(post => !post.draft).map(post => [post, PostRow.getCompany(post)] as [Post, Company])
        .filter(([post, company]) => company.id != user.profile!.company.id);
    });
  }
  
  activeView: number = 0;
  annonces = new Array(10);

  openAdFilterMenu: boolean = false;

  imports = { DistanceSliderConfig, SalarySliderConfig };

  editMenu: PostMenu = { open: false, post: null };

  checkMenu: PostMenu & { swipeup: boolean; } = { open: false, post: null, swipeup: false }

  openPost(post: Post) {
    console.log('setting post', post);
    this.editMenu = { open: true, post };
  }

  checkPost(post: Post) {
    this.checkMenu = { open: true, post, swipeup: false };
  }

  checkPostMenu() {
    this.checkMenu.swipeup = true;
  }

  duplicatePost(id: number) {
    this.store.dispatch(new DuplicatePost(id)).pipe(take(1)).subscribe(() => {
      this.checkMenu = {open: false, post: null, swipeup: false};
    }, () => {
      console.log('duplication error')
      this.info.show("error", "Erreur lors de la duplication de l'annonce");
    });
  }

  switchDraft(id: number) {
    this.store.dispatch(new SwitchPostType(id)).pipe(take(1)).subscribe(() => {
      this.checkMenu = {open: false, post: null, swipeup: false};
    }, () => {
      this.info.show("error", "Echec");
    });
  }

  deletePost(id: number) {
    this.store.dispatch(new DeletePost(id)).pipe(take(1)).subscribe(() => {
      this.checkMenu = {open: false, post: null, swipeup: false};
    }, () => {
      this.info.show("error", 'Echec de suppression..');
    });
  }
};