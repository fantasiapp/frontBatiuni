import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Profile } from "src/models/new/data.interfaces";
import { DataQueries, QueryProfile } from "src/models/new/data.state";
import { MyStore } from "src/app/shared/common/classes";

@Component({
  selector: "reponse-card",
  templateUrl: "reponse.card.html",
  styleUrls: ["reponse.card.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReponseCard {
  @QueryProfile()
  @Input("profile")
  profile$!: number | Profile | Observable<Profile>;

  constructor(private store: MyStore) {}

  ngOnInit() {
    const profile = this.store.selectSnapshot(DataQueries.currentProfile);
  }
}
