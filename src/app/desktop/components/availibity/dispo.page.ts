import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Select } from "@ngxs/store";
import { Observable } from "rxjs";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";

@Component({
    selector:"dispo-page",
    templateUrl:'dispo.page.html',
    styleUrls:['dispo.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DispoPage {
    @Select(UserState)
    user$!: Observable<User>;
}