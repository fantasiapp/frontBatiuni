import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Select } from "@ngxs/store";
import { Observable } from "rxjs";
import { Profile } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";

@Component({
  selector: 'reponse-page',
  templateUrl: './reponse.page.html',
  styleUrls: ['./raponse.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponsePage {
  activeView: number = 0;

  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;
};