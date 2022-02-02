import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { take } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { filterSplit } from "src/app/shared/common/functions";
import { Serialized } from "src/app/shared/common/types";
import { InfoService } from "src/app/shared/components/info/info.component";
import { Company, Post, PostRow } from "src/models/data/data.model";
import { DataState } from "src/models/data/data.state";
import { DeletePost, SwitchPostType } from "src/models/user/user.actions";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";
type PostMenu = { open: boolean; post: Post | null; };


@Component({
  selector: 'home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent extends Destroy$ {

  @Select(UserState)
  user$!: Observable<User>;

  @Select(DataState.get('posts'))
  posts$!: Observable<Post[]>;

  constructor(private store: Store, private info: InfoService) {
    super()
  }

  viewPostLength() {
    let length = 0;
    if(this.activeView == 0) length = this.userDrafts.length
    if(this.activeView == 1) length = this.userOnlinePosts.length
    return length
  }

  userPosts: Post[] = [];
  userDrafts: Post[] = [];
  userOnlinePosts: Post[] = [];

  allOnlinePosts: [Post, Company][] = [];

  checkMenu: PostMenu & { swipeup: boolean; } = { open: false, post: null, swipeup: false }

  activeView: number = 0;
  annonces = new Array(10).fill(0);

  getDrafts(user: User) { return user.profile?.company.posts.filter(post => post.draft); }
  
  openPost(post: Serialized<PostRow>) {
    console.log('opening post row');
  }
  ngOnInit() {
    combineLatest([this.user$, this.posts$]).subscribe(([user, posts]) => {
      this.userPosts = user.profile?.company.posts || [];
      [this.userOnlinePosts, this.userDrafts] = filterSplit(this.userPosts, post => !post.draft);
      
      this.allOnlinePosts = posts.filter(post => !post.draft).map(post => [post, PostRow.getCompany(post)] as [Post, Company])
        .filter(([post, company]) => company.id != user.profile!.company.id);
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