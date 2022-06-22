import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, QueryList, ViewChildren } from "@angular/core";
import { DistanceSliderConfig, SOSSalarySliderConfig } from "src/app/shared/common/sliderConfig";
import { Company, Job, Post, Profile } from "src/models/new/data.interfaces";
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { Filter } from "../directives/filter.directive";
import { DataQueries, SnapshotAll } from "src/models/new/data.state";
import { UISwitchComponent } from "../components/switch/switch.component";
import { FilterService } from "../services/filter.service";
import { Store } from "@ngxs/store";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import "hammerjs"

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
      <input type="text" class="form-element" formControlName="address" (keyup)="returnInputKeyboard($event, inputAddress)" #inputAddress/>
    </div>

    <div class="form-input">
      <label>Dans un rayon autour de</label>
      <ngx-slider [(value)]=valueDistance [options]="imports.DistanceSliderConfig" formControlName="radius" (userChange)="detectChange()"></ngx-slider>
    </div>


    <div class="form-input">
      <label>Estimation de salaire</label>
      <ngx-slider [options]="imports.SOSSalarySliderConfig" [value]="0" [highValue]="400" formControlName="amount" (userChange)="detectChange()"></ngx-slider>
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
  imports = { DistanceSliderConfig, SOSSalarySliderConfig };

  valueDistance: number = 2000;

  @Input()
  activeView: number = 0;

  @Input()
  callbackFilter: Function = () => {};

  filterForm = new FormGroup({
    address: new FormControl(""),
    jobs: new FormControl([]),
    radius: new FormControl(2000),
    amount: new FormControl(),
    sortNotation: new FormControl(false),
    sortFullProfils: new FormControl(false),
    sortDisponibleProfils: new FormControl(false),
  },
    {}
  );

  constructor(private store: Store, private cd: ChangeDetectorRef){}

  @SnapshotAll('Job')
  allJobs!: Job[];

  ngOnInit(){
    this.callbackFilter(this.filterForm.value);
    this.filterForm.valueChanges.subscribe(value => {
      this.callbackFilter(value);
    })
  }

  detectChange(){
    this.cd.detectChanges();
  }

  returnInputKeyboard(e: any, input: HTMLInputElement){
    console.log('object', e.keyCode);
    if(e.keyCode == 13){
      input.blur()
    }
  }
}