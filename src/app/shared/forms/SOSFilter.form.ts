import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from "@angular/core";
import { DistanceSliderConfig, SOSSalarySliderConfig } from "src/app/shared/common/sliderConfig";
import { Company, Job, Post, Profile } from "src/models/new/data.interfaces";
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { Filter } from "../directives/filter.directive";
import { DataQueries, SnapshotAll } from "src/models/new/data.state";
import { UISwitchComponent } from "../components/switch/switch.component";
import { FilterService } from "../services/filter.service";
import { Store } from "@ngxs/store";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { returnInputKeyboard } from '../common/classes'
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
        <div class="action-button-filter flex row space space-between full-width">
          <button class="button passive" (click)="onResetFilter()">Reinitialiser</button>
          <button class="button active" (click)="onCloseFilter()">Valider</button>
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

  @Output() refreshMap = new EventEmitter()
  detectChange(){
    this.callbackFilter(this.filterForm.value)
    this.refreshMap.next()
    this.cd.detectChanges();
  }

  @Output() closeFilter = new EventEmitter()
  onCloseFilter(){
    this.closeFilter.next(this.filterForm.value)
    this.detectChange()
  }
  onResetFilter(){
   this.filterForm.get('address')?.patchValue('') 
   this.filterForm.get('jobs')?.patchValue([]) 
   this.filterForm.get('radius')?.patchValue(2000) 
   this.filterForm.get('amount')?.patchValue('') 
   this.filterForm.get('sortNotation')?.patchValue(false) 
   this.filterForm.get('sortFullProfils')?.patchValue(false) 
   this.filterForm.get('sortDisponibleProfils')?.patchValue(false) 
   this.detectChange()
  }
  returnInputKeyboard = returnInputKeyboard
}