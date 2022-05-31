import { Select, Store } from "@ngxs/store";
import { ChangeDetectionStrategy, Component, ChangeDetectorRef, Input, ViewChild, EventEmitter, Output, ViewEncapsulation} from "@angular/core";
import { Destroy$ } from "src/app/shared/common/classes";
import { Mission, PostDateAvailableTask } from "src/models/new/data.interfaces";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { UIAccordion } from "src/app/shared/components/accordion/accordion.ui";


@Component({
    selector: 'suivi-chantier_date',
    templateUrl:"suivi_chantier_date.page.html",
    styleUrls:['suivi_chantier_date.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
  })

export class SuiviChantierDate extends Destroy${



  
  constructor(private cd: ChangeDetectorRef, private store: Store, private popup: PopupService) {
    super()
  }
    
  @Input()
  view: 'ST' | 'PME' = "PME";
  _date: PostDateAvailableTask = {id:-1, date:'', validated: false, deleted:false, supervisions: [], postDetails: [], allPostDetails: []}
  get date() { return this._date; }
  
  @ViewChild('accordion') accordion!:UIAccordion;
  
  
  
  @Input()
  set date(date: PostDateAvailableTask) {
    this._date = date;
  }
  
  _mission: Mission | null = null;
  get mission() { return this._mission; }
  
  @Input()
  set mission(mission: Mission | null) {
    // this.view = this.store.selectSnapshot(DataState.view)
    this._mission = mission;
  }
  
  // get reloadMission() { return this._reloadMission; }
  
@Input()
reloadMission!: (date:number) => (PostDateAvailableTask|Mission)[] 
  
}