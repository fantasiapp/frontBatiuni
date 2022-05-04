import { ChangeDetectionStrategy, Component, Input, QueryList, ViewChildren } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Store } from "@ngxs/store";
import { DistanceSliderConfig, SalarySliderConfig } from "src/app/shared/common/config";
import { Job, Mission } from "src/models/new/data.interfaces";
import { SnapshotAll } from "src/models/new/data.state";
import { UISwitchComponent } from "../components/switch/switch.component";
import { Filter } from "../directives/filter.directive";
import { FilterService } from "../services/filter.service";


@Component({
  selector: 'mission-filter-form',
  template: `
    <form class="form-control full-width" [formGroup]="filterForm">
      <div class="form-input">
        <label>Date de validation</label>
        <input type="date" formControlName="validationDate"/>
        <img src="assets/calendar.png"/>
      </div>

      <div class="form-input">
        <label>Date de mission</label>
        <input type="date" formControlName="missionDate"/>
        <img src="assets/calendar.png"/>
      </div>

      <div class="form-input">
        <label>Adresse de chantier</label>
        <input type="text" formControlName="address"/>
      </div>

      <div class="form-input">
        <label>Métier</label>
        <options [options]="allJobs" formControlName="jobs"></options>
      </div>

      <div class="form-input">
        <label>Type</label>
        <div class="flex row radio-container">
          <div class="radio-item">
            <radiobox class="grow" name="job-type" formControlName="manPower" #manPower1></radiobox>
            <span (click)="manPower1.onChange($event)">Main d'oeuvre</span>
          </div>
          <div class="radio-item">
            <radiobox class="grow" name="job-type" formControlName="manPower" #manPower2></radiobox>
            <span (click)="manPower2.onChange($event)">Fourniture et pose</span>
          </div>
        </div>
      </div>

      <div class="form-input space-children-margin">
        <div class="switch-container flex center-cross">
          <span class="criteria" (click)="unRead.onChangeCall()">Notifications suivi de chantier non lu</span>
          <switch class="default" (valueChange)="onSwitchClick($event, [switch2])" formControlName="unread" #unRead></switch>
        </div>

        <label>Réorganiser la liste selon</label>
        <div class="switch-container flex center-cross">
          <span class="criteria" (click)="switch1.onChangeCall()">Mission clôturer</span>
          <switch class="default" (valueChange)="onSwitchClick($event, [switch2])" #switch1></switch>
        </div>
        <div class="switch-container flex center-cross">
          <span class="criteria" (click)="switch2.onChangeCall()">Date de mission la plus proche à la plus lointaine</span>
          <switch class="default" (valueChange)="onSwitchClick($event, [switch2])" #switch2></switch>
        </div>
      </div>
    </form>
 
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;    
    }
    
    switch::ng-deep .slider {
      background: #ccc;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
//save computed properties
export class MissionFilterForm extends Filter<Mission> {
  imports = { DistanceSliderConfig, SalarySliderConfig };

  @Input('filter') name: string = 'Mission';

  @Input()
  callbackFilter: Function = () => {};

  @ViewChildren(UISwitchComponent)
  switches!: QueryList<UISwitchComponent>;

  filterForm = new FormGroup({
    missionDate: new FormControl(""),
    validationDate: new FormControl(""),
    address: new FormControl(""),
    jobs: new FormControl([]),
    manPower: new FormControl(undefined),
    unread: new FormControl(false),
  },
    {}
  );

  //cancel other filters
  onSwitchClick(value: boolean, cancelIfTrue: UISwitchComponent[]) {
    if ( !value ) return;
    this.switches.forEach(item => {
      if ( cancelIfTrue.includes(item) ) {
        item.value = false;
      }
    })
  }

  ngAfterViewInit(): void {
    
  }

  constructor(service: FilterService, private store: Store) {
    super(service);
  }

  @SnapshotAll('Job')
  allJobs!: Job[];

  ngOnInit(): void {
    super.ngOnInit();
    console.log("start form test")
    console.log("form init callbackFilter", this.callbackFilter)
    this.callbackFilter(this.filterForm.value);

    this.filterForm.valueChanges.subscribe(value => {
      console.log("form test", value);
      console.log(this.callbackFilter)
      this.callbackFilter(value);
    })
  }
}