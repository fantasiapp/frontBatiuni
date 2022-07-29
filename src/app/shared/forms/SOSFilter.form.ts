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

      <footer
        class="flex row space-between sticky-footer full-width submit-container background-white"
        style="z-index: 2;">
        <div class="action-button-filter flex row space space-between full-width">
          <div class="button passive" (click)="onResetFilter()">Réinitialiser</div>
          <div class="button active" (click)="onCloseFilter()">Valider</div>
        </div>
      </footer>
    </div>
  </form>
</ng-container>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%; 
      max-height: calc(90vh - 50px - 3rem);
      padding: 0 2rem;
      padding-bottom: calc(3rem + env(safe-area-inset-bottom));
      overflow: scroll;
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

  valueSalary: number = 400;

  @Input()
  activeView: number = 0;

  @Input()
  callbackFilter: Function = () => {};

  filterForm = new FormGroup({
    address: new FormControl(""),
    jobs: new FormControl([]),
    radius: new FormControl(2000),
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
   this.filterForm.get('sortNotation')?.patchValue(false) 
   this.filterForm.get('sortFullProfils')?.patchValue(false) 
   this.filterForm.get('sortDisponibleProfils')?.patchValue(false) 
   this.detectChange()
  }
  returnInputKeyboard = returnInputKeyboard
}