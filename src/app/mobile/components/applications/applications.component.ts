import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { combineLatest, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Post, PostMenu, Profile } from "src/models/new/data.interfaces";
import { DataQueries, QueryAll } from "src/models/new/data.state";
import { Destroy$ } from "src/app/shared/common/classes";
import { assignCopy, splitByOutput } from "../../../shared/common/functions";
import { MarkViewed } from "src/models/new/user/user.actions";
import { UIAnnonceResume } from "src/app/mobile/ui/annonce-resume/annonce-resume.ui";
// import { UISlideMenuComponent } from 'src/app/shared/components/slidemenu/slidemenu.component';

@Component({
  selector: "applications",
  templateUrl: "./applications.component.html",
  styleUrls: ["./applications.component.scss"],
})
export class ApplicationsComponent extends Destroy$ implements OnInit {
  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  @QueryAll("Post")
  posts$!: Observable<Post[]>;

  //split the set all of posts into these (what we need)
  private symbols = {
    userDraft: 0,
    userOnlinePost: 1,
    otherOnlinePost: 2,
    discard: -1,
  };

  openAdFilterMenu: boolean = false;

  postMenu = new PostMenu();

  userDrafts: Post[] = [];
  userOnlinePosts: Post[] = [];
  allOnlinePosts: Post[] = [];
  constructor(private store: Store) {
    super();
  }

  ngOnInit(): void {
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
  }

  hasPostulated(post: Post) {
    const profile = this.store.selectSnapshot(DataQueries.currentProfile);
    let companiesId;
    if (post) {
      companiesId = post.candidates?.map((id: number) => {
        let candidate = this.store.selectSnapshot(
          DataQueries.getById("Candidate", id)
        );
        return candidate!.company;
      });
    }
    return companiesId?.includes(profile.company.id);
  }

  openPost(post: Post | null) {
    //mark as viewed
    this.postMenu = assignCopy(this.postMenu, {
      post,
      open: !!post,
      swipeup: false,
    });
    if (post) this.store.dispatch(new MarkViewed(post.id));
    setTimeout(() => {
      // this.annonceResume.open()
    }, 20);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  slideOnlinePostClose() {
    this.postMenu.open = false;
    // Update
    this.annonceResume.close();
  }

  @ViewChild(UIAnnonceResume, { static: false })
  private annonceResume!: UIAnnonceResume;
}
