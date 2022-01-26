import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Select } from "@ngxs/store";
import { BehaviorSubject } from "rxjs";
import { Serialized } from "src/app/shared/common/types";
import { PostRow } from "src/models/data/data.model";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";

@Component({
  selector: 'home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {

  @Select(UserState)
  user$!: BehaviorSubject<User>;

  activeView: number = 0;
  annonces = new Array(10).fill(0);

  getDrafts(user: User) { return user.profile?.company.posts.filter(post => post.draft); }

  openPost(post: Serialized<PostRow>) {
    console.log('opening post row');
  }
};