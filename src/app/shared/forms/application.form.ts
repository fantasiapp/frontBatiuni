import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, QueryList, ViewChildren } from "@angular/core";
import { FormControl, FormGroup} from "@angular/forms";
import { Store } from "@ngxs/store";
import { Job, Post } from "src/models/new/data.interfaces";
import { SnapshotAll } from "src/models/new/data.state";
import { FilterService } from "../services/filter.service";
import { UISwitchComponent } from "../components/switch/switch.component";
import { Filter } from "../directives/filter.directive";
import { returnInputKeyboard } from '../common/classes'

@Component({
  selector: "application-filter-form",
  template: `
    <form class="form-control full-width" [formGroup]="filterForm">
        <div class="form-input">
          <label>Date à laquelle vous avez postulé</label>
          <input type="date" class="form-element" formControlName="postulationDate"/>
          <img src="assets/calendar.png" class='img-calendar'/>
        </div>

        <div class="form-input">
          <label>Date de mission</label>
          <div class="form-input flex row space-between">
            <label style="flex-shrink: 0">À partir de : </label>
            <input type="date" style="padding-left: 0.5rem;" class="form-element" formControlName="missionDate" #inputDateMission/>
            <img src="assets/calendar.png" (click)="inputDateMission.select()" class="img-calendar-since" style="pointer-events: none;"/>
          </div>
        </div>

        <div class="form-input">
          <label>Adresse de chantier</label>
          <input type="text" class="form-element" formControlName="address" (keyup)="returnInputKeyboard($event, inputAddress)" #inputAddress/>
        </div>

        <div class="form-input form-spacer">
          <label>Métier</label>
          <options [options]="allJobs" formControlName="jobs"></options>
        </div>

        <div class="form-input form-spacer">
          <label class="form-title">Type</label>
          <div class="flex row radio-container">
            <div class="radio-item">
              <radiobox class="grow" onselect="true" name="job-type" formControlName="manPower" #manPower1></radiobox>
              <span (click)="manPower1.onChange($event)">Main d'oeuvre</span>
            </div>
            <div class="radio-item">
              <radiobox class="grow" onselect="false" name="job-type" formControlName="manPower" #manPower2></radiobox>
              <span (click)="manPower2.onChange($event)">Fourniture et pose</span>
            </div>
          </div>
        </div>

        <div class="form-input">
          <label class="form-title">Réorganiser la liste selon</label>
            <div class="switch-container flex center-cross">
              <span class="criteria" (click)="sortPostDate.onChangeCall()">Date de validation de la plus proche à la plus lointaine</span> 
              <switch class="default" formControlName="sortPostDate" #sortPostDate></switch>
            </div>
            <div class="switch-container flex center-cross">
              <span class="criteria" (click)="sortMissionDate.onChangeCall()">Date de mission de la plus proche à la plus lointaine</span> 
              <switch class="default" formControlName="sortMissionDate" #sortMissionDate></switch>
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

    .form-title {
      margin-bottom: 0.5rem
    }
    
    switch::ng-deep .slider {
      background: #ccc;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ApplicationForm extends Filter<Post>  {

    @Input("filter") name: string = "Application";
  
    @Input()
    callbackFilter: Function = () => {};

    @ViewChildren(UISwitchComponent)
    switches!: QueryList<UISwitchComponent>;
  
    filterForm = new FormGroup({
      postulationDate: new FormControl(""),
      missionDate: new FormControl(""),
      address: new FormControl(""),
      jobs: new FormControl([]),
      manPower: new FormControl(undefined),
      sortPostDate: new FormControl(false),
      sortMissionDate: new FormControl(false),
    },
      {}
    );

    onSwitchClick(value: boolean, cancelIfTrue: UISwitchComponent[]) {
        if (!value) return;
        this.switches.forEach((item) => {
          if (cancelIfTrue.includes(item)) {
            item.value = false;
          }
        });
    }
  
    ngAfterViewInit(): void {}

    constructor(service: FilterService, private store: Store) {
        super(service);
    }
  
    @SnapshotAll('Job')
    allJobs!: Job[];
  
    ngOnInit(): void {
      super.ngOnInit();
      this.callbackFilter(this.filterForm.value);

      this.filterForm.valueChanges.subscribe((value) => {
        this.callbackFilter(value);
      });
    }

    returnInputKeyboard = returnInputKeyboard

}    