import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Select } from "@ngxs/store";
import { BehaviorSubject, Observable } from "rxjs";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";

@Component({
  selector: 'reponse-page',
  templateUrl: './reponse.page.html',
  styleUrls: ['./raponse.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponsePage {
    activeView: number = 0;
    @Select(UserState)
    user$!: Observable<User>;
    ngOnInit() {
        this.user$.subscribe(console.log)
    }
};