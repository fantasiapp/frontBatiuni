import { ChangeDetectionStrategy, Component, Input, OnInit, QueryList, ViewChildren } from "@angular/core";
import { DistanceSliderConfig, SalarySliderConfig } from "src/app/shared/common/config";
import { Company, Job, Post, Profile } from "src/models/new/data.interfaces";
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { Filter } from "../directives/filter.directive";
import { DataQueries, SnapshotAll } from "src/models/new/data.state";
import { UISwitchComponent } from "../components/switch/switch.component";
import { FilterService } from "../services/filter.service";
import { Store } from "@ngxs/store";
import { FormArray, FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: 'sos-filter-form',
  template: `
  <ng-container [ngSwitch]="activeView">
  <form class="form-control full-width" [formGroup]="filterForm">
  <div class="form-input">
      <label>Métier</label>
      <options [options]="allJobs" formControlName="jobs"></options>
  </div>

    <div class="form-input">
      <label>Adresse de chantier</label>
      <input type="text" class="form-element" formControlName="address"/>
    </div>

    <div class="form-input">
      <label>Dans un rayon autour de</label>
      <ngx-slider [(value)]=valueDistance [options]="imports.DistanceSliderConfig" formControlName="radius"></ngx-slider>
    </div>


    <div class="form-input">
      <label>Estimation de salaire</label>
      <ngx-slider [options]="imports.SalarySliderConfig" [value]="0" [highValue]="400" formControlName="amount"></ngx-slider>
    </div>


    <div class="form-input space-children-margin">
      <label class="form-title">Réorganiser la liste selon</label>
      <div class="switch-container flex center-cross">
        <span class="criteria">La meilleur note à la moins bonne</span> 
        <switch class="default" formControlName="sortNotation"></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Les profils les plus complets</span> 
        <switch class="default" formControlName="sortFullProfils"></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Les profils affichés comme disponibles</span> 
        <switch class="default" formControlName="sortDisponibleProfils"></switch>
      </div>
    </div>
  </form>
</ng-container>
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

export class SOSFilterForm implements OnInit {
  imports = { DistanceSliderConfig, SalarySliderConfig };

  valueDistance: number = 1000;

  @Input()
  activeView: number = 0;

  @Input()
  callbackFilter: Function = () => {};

  filterForm = new FormGroup({
    address: new FormControl(""),
    jobs: new FormControl([]),
    radius: new FormControl(1000),
    amount: new FormControl(),
    sortNotation: new FormControl(false),
    sortFullProfils: new FormControl(false),
    sortDisponibleProfils: new FormControl(false),
  },
    {}
  );

  constructor(private store: Store){}

  @SnapshotAll('Job')
  allJobs!: Job[];

  ngOnInit(){
    this.callbackFilter(this.filterForm.value);
    this.filterForm.valueChanges.subscribe(value => {
      this.callbackFilter(value);
    })
  }

}