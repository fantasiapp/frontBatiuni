import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Store } from "@ngxs/store";
import { Company, Mission, PostDetail, Supervision } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";

@Component({
  selector: 'suivi-pme',
  templateUrl:"suivi-pme.page.html",
  styleUrls:['suivi-pme.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuiviPME {

  company: Company | null = null;
  track: {[key: string]: Supervision[]} = {};

  _mission: Mission | null = null;
  get mission() { return this._mission; }
  @Input()
  set mission(mission: Mission | null) {
    this._mission = mission;
    this.company = mission ? this.store.selectSnapshot(DataQueries.getById('Company', mission.company)) : null;
    //load all supervisions, group by days
    if ( mission ) {
      const details = this.store.selectSnapshot(DataQueries.getMany('DetailedPost', mission.details)),
        supervisions = details.reduce((res: Supervision[], detail: PostDetail) => {
          const objects = this.store.selectSnapshot(DataQueries.getMany('Supervision', detail.supervisions));
          return [...res, ...objects];
        }, []);
      
      for ( const item of supervisions ) {
        if ( !this.track[item.date] ) this.track[item.date] = [item];
        else this.track[item.date].push(item);
      }
    }
  }

  constructor(private store: Store) {}
  
  swipemenu: boolean = false;
}