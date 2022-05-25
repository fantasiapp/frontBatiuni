import { Component, OnDestroy, OnInit } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { combineLatest, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Post, PostMenu, Profile } from "src/models/new/data.interfaces";
import { DataQueries, QueryAll } from "src/models/new/data.state";
import { Destroy$ } from "src/app/shared/common/classes";
import { assignCopy, splitByOutput } from "../../common/functions";
import { MarkViewed } from "src/models/new/user/user.actions";
import { getUserDataService } from "../../services/getUserData.service";

@Component({
  selector: "applications",
  templateUrl: "./applications.component.html",
  styleUrls: ["./applications.component.scss"],
})
export class ApplicationsComponent extends Destroy$ implements OnInit {
  // @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  // @QueryAll("Post")
  posts$!: Observable<Post[]>;

  //split the set all of posts into these (what we need)
  private symbols = {
    userDraft: 0,
    userOnlinePost: 1,
    otherOnlinePost: 2,
    discard: -1,
  };

  postMenu = new PostMenu();

  userDrafts: Post[] = [];
  userOnlinePosts: Post[] = [];
  allOnlinePosts: Post[] = [];
  hasCombinedLatest: boolean = false;
  constructor(private store: Store, private getUserDataService: getUserDataService) {
    super();
    this.profile$ = store.select(DataQueries.currentProfile)
    this.posts$ = store.select(DataQueries.getAll("Post"))
  }

  ngOnInit(): void {
    this.getUserDataService.getDataChangeEmitter().subscribe((value) => {
      this.profile$ = this.store.select(DataQueries.currentProfile)
      this.posts$ = this.store.select(DataQueries.getAll("Post"))
      this.initAll()
  })
    this.initAll()
  }

  initAll() {
    this.initCombinedLatest()
  }

  initCombinedLatest() {
    if(!this.hasCombinedLatest) {
      combineLatest([this.profile$, this.posts$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([profile, posts]) => {
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
        this.userDrafts = mapping.get(this.symbols.userDraft) || [];
        this.userOnlinePosts = mapping.get(this.symbols.userOnlinePost) || [];
        this.allOnlinePosts = [...otherOnlinePost, ...this.userOnlinePosts];
      });
      this.hasCombinedLatest = true
    }
  }

  openPost(post: Post | null) {
    //mark as viewed
    this.postMenu = assignCopy(this.postMenu, {
      post,
      open: !!post,
      swipeup: false,
    });
    if (post) this.store.dispatch(new MarkViewed(post.id));
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
