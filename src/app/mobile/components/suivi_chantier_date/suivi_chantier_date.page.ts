import { Select, Store } from "@ngxs/store";
import { ChangeDetectionStrategy, Component, ChangeDetectorRef, Input, ViewChild, EventEmitter, Output, ViewEncapsulation} from "@angular/core";
import { Destroy$ } from "src/app/shared/common/classes";
import { Mission, DatePost } from "src/models/new/data.interfaces";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { UIAccordion } from "src/app/shared/components/accordion/accordion.ui";
import { DataQueries } from "src/models/new/data.state";


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

  @Input()
  mission: Mission | null = null;

  _dateId = -1
  @Input()
  set dateId(id: number) {
    this.datePost = this.store.selectSnapshot(DataQueries.getById("DatePost", id))!
    this._dateId = id
  }

  get dateId() {
    return this._dateId
  }
    

  datePost:DatePost = {id:5, date:'12-12-2022', validated: false, deleted:false, supervisions: [], details: []}
  
  @ViewChild('accordion') accordion!:UIAccordion;
  
  @Output() computeDate: EventEmitter<any> = new EventEmitter();

  onComputeDate(){
    console.log('object');
    this.computeDate.next()
  }
}