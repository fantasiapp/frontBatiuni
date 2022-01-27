import { Component, ChangeDetectionStrategy } from "@angular/core";
import { Select } from "@ngxs/store";
import { BehaviorSubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { DistanceSliderConfig, SalarySliderConfig } from "src/app/shared/common/config";
import { filterSplit } from "src/app/shared/common/functions";
import { Serialized } from "src/app/shared/common/types";
import { Post, PostRow } from "src/models/data/data.model";
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
  user$!: BehaviorSubject<User>;

  constructor() {
    super()
  }

  userPosts: Post[] = [];
  userDrafts: Post[] = [];
  userOnlinePosts: Post[] = [];
  userValidatedPosts: Post[] = [];

  ngOnInit() {
    this.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.userPosts = user.profile?.company.posts || [];
      [this.userOnlinePosts, this.userDrafts] = filterSplit(this.userPosts, post => !post.draft);
    });
  }
  
  activeView: number = 0;
  annonces = new Array(10);

  openAdFilterMenu: boolean = false;

  imports = { DistanceSliderConfig, SalarySliderConfig };

  editMenu: PostMenu = { open: false, post: null };

  checkMenu: PostMenu & { swipeup: boolean; } = { open: false, post: null, swipeup: false }

  openPost(post: Post) {
    this.editMenu = { open: true, post };
  }

  checkPost(post: Post) {
    this.checkMenu = { open: true, post, swipeup: false };
  }

  checkPostMenu() {
    console.log('menu');
    this.checkMenu.swipeup = true;
  } 
};