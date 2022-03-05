import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { Company, Mission, PostDetail, Profile, Supervision } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";

@Component({
  selector: 'suivi-chantier',
  templateUrl:"suivi-pme.page.html",
  styleUrls:['suivi-pme.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuiviPME {

  company: Company | null = null;
  track: {[key: string]: Map<PostDetail, Supervision[]>} = {};

  //track[data][detail]


  _mission: Mission | null = null;
  get mission() { return this._mission; }
  @Input()
  set mission(mission: Mission | null) {
    this._mission = mission;
    this.company = mission ? this.store.selectSnapshot(DataQueries.getById('Company', mission.company)) : null;
    //load all supervisions, group by days
    if ( mission ) {
      const details = this.store.selectSnapshot(DataQueries.getMany('DetailedPost', mission.details));
      details.forEach(detail => {
        const supervisions = this.store.selectSnapshot(DataQueries.getMany('Supervision', detail.supervisions));
        for ( const supervision of supervisions ) {
          const existing = this.track[supervision.date];
          if ( existing ) {
            if ( existing.has(detail) )
              existing.get(detail)!.push(supervision);
            else
              existing.set(detail, [supervision]);
          } else {
            this.track[supervision.date] = new Map;
            this.track[supervision.date].set(detail, [supervision]);
          }
        }
      });
    }
  }

  constructor(private store: Store, private popup: PopupService) {}
  
  swipemenu: boolean = false;

  @Select(DataQueries.currentProfile)
  currentProfile$!: Observable<Profile>;

  validate(key: any) {
    console.log(key)
  }

  signContract() {
    this.popup.openSignContractDialog(this.mission!);
  }
}