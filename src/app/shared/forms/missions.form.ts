import { ChangeDetectionStrategy, Component, Input, QueryList, ViewChildren } from "@angular/core";
import { Store } from "@ngxs/store";
import { DistanceSliderConfig, SalarySliderConfig } from "src/app/shared/common/config";
import { Mission } from "src/models/new/data.interfaces";
import { UISwitchComponent } from "../components/switch/switch.component";
import { Filter } from "../directives/filter.directive";
import { FilterService } from "../services/filter.service";


@Component({
  selector: 'mission-filter-form',
  template: `
  <!--
    <form class="form-control full-width" [formGroup]="form">
      <div class="form-input">
        <label>Date de validation</label>
        <input type="date"/>
        <img src="assets/calendar.png"/>
      </div>

      <div class="form-input">
        <label>Date de mission</label>
        <input type="date"/>
        <img src="assets/calendar.png"/>
      </div>

      <div class="form-input">
        <label>Adresse de chantier</label>
        <input type="text"/>
      </div>

      <div class="form-input">
        <label>Métier</label>
        <options></options>
      </div>

      <div class="form-input">
        <label>Type</label>
        <div class="flex row radio-container">
          <div class="radio-item">
            <radiobox class="grow" name="job-type"></radiobox>
            Main d'oeuvre
          </div>
          <div class="radio-item">
            <radiobox class="grow" name="job-type"></radiobox>
            Fourniture et pose
          </div>
        </div>
      </div>

      <div class="form-input space-children-margin">
        <div class="switch-container flex center-cross">
          <span class="criteria">Norifications suivi de chantier non lu</span>
          <switch class="default" (valueChange)="onSwitchClick($event, [switch2])"></switch>
        </div>

        <label>Réorganiser la liste selon</label>
        <div class="switch-container flex center-cross">
          <span class="criteria">Mission clôturer</span>
          <switch class="default" (valueChange)="onSwitchClick($event, [switch2])" #switch1></switch>
        </div>
        <div class="switch-container flex center-cross">
          <span class="criteria">Date de mission la plus proche à la plus lointaine</span>
          <switch class="default" (valueChange)="onSwitchClick($event, [switch2])" #switch2></switch>
        </div>
      </div>
    </form>
  -->
  <div>hello</div>
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

  @ViewChildren(UISwitchComponent)
  switches!: QueryList<UISwitchComponent>;

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

  ngOnInit(): void {
    super.ngOnInit();
  }
}