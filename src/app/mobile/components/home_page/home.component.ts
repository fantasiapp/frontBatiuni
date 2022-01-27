import { Component, ChangeDetectionStrategy } from "@angular/core";
import { Select } from "@ngxs/store";
import { BehaviorSubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { DistanceSliderConfig, SalarySliderConfig } from "src/app/shared/common/config";
import { Serialized } from "src/app/shared/common/types";
import { PostRow } from "src/models/data/data.model";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent extends Destroy$ {
  
  @Select(UserState)
  user$!: BehaviorSubject<User>;

  getDrafts(user: User) { return user.profile?.company.posts.filter(post => post.draft); }

  constructor() {
    super()
  }

  ngOnInit() {
    this.user$.pipe(takeUntil(this.destroy$)).subscribe(console.log);
    // console.log(this.user$.subscribe(console.log))
  }
  
  activeView: number = 0;
  annonces = new Array(10);

  openAdFilterMenu: boolean = false;

  imports = { DistanceSliderConfig, SalarySliderConfig };

  editMenu: { open: boolean; post: Serialized<PostRow> | null; } = {
    open: false,
    post: null
  };

  openPost(post: Serialized<PostRow>) {
    this.editMenu = {
      open: true, post
    }
  }
};