import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Store } from "@ngxs/store";
import { Job } from "src/models/new/data.interfaces";
import { SnapshotAll } from "src/models/new/data.state";

@Component({
  selector: 'pme-filter-form',
  template: `
    <ng-container [ngSwitch]="activeView">
      <form class="form-control full-width" *ngSwitchCase="0" [formGroup]="filterForm">
        <div class="form-input">
          <label>Date de mission</label>
          <input type="date" class="form-element" formControlName="date"/>
          <img src="assets/calendar.png"/>
        </div>

        <div class="form-input">
          <label>Adresse de chantier</label>
          <input type="text" class="form-element" formControlName="address"/>
        </div>

        <div class="form-input form-spacer">
          <label>Métier</label>
          <options [options]="allJobs" formControlName="jobs"></options>
        </div>

        <div class="form-input form-spacer">
          <label class="form-title">Type</label>
          <div class="flex row radio-container">
            <div class="radio-item">
              <radiobox class="grow" onselect="true" name="job-type" formControlName="manPower"></radiobox>
              <span>Main d'oeuvre</span>
            </div>
            <div class="radio-item">
              <radiobox class="grow" onselect="false" name="job-type" formControlName="manPower"></radiobox>
              <span>Fourniture et pose</span>
            </div>
          </div>
        </div>

        <div class="form-input">
          <label class="form-title">Réorganiser la liste selon</label>
          <div class="switch-container flex center-cross">
            <span class="">Les brouillons les plus anciens</span> <switch class="default"></switch>
          </div>
          <div class="switch-container flex center-cross">
            <span class="">Les brouillons les plus complets</span> <switch class="default"></switch>
          </div>
        </div>
      </form>
      <online-filter-form [target]="activeView == 1 ? 'réponses' : 'notifications'" *ngSwitchDefault></online-filter-form>
    </ng-container>
  `,
  styles: [`
    @use 'src/styles/responsive' as *;

    :host {
      display: block;
      width: 100%;
    }

    form {
      
    }

    .form-title {
      margin-bottom: 0.5rem
    }
    
    switch::ng-deep .slider {
      background: #ccc;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PMEFilterForm implements OnInit {
  //determine which filter is open
  @Input()
  activeView: number = 0;

  @Input()
  callbackFilter: Function = () => {};

  filterForm = new FormGroup({
    date: new FormControl(""),
    address: new FormControl(""),
    jobs: new FormControl([]),
    manPower: new FormControl(undefined),
  },
    {}
  );

  constructor(private store: Store){}

  @SnapshotAll('Job')
  allJobs!: Job[];

  ngOnInit(){
    console.log("start form test")
    this.callbackFilter(this.filterForm.value);

    this.filterForm.valueChanges.subscribe(value => {
      console.log("form test", value);
      this.callbackFilter(value);
    })
  }
  
}