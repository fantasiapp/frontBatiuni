import { ChangeDetectionStrategy, Component, Input, QueryList, ViewChildren } from "@angular/core";
import { DistanceSliderConfig, SalarySliderConfig } from "src/app/shared/common/config";
import { Company, Job, Post, Profile } from "src/models/new/data.interfaces";
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { Filter } from "../directives/filter.directive";
import { SnapshotAll } from "src/models/new/data.state";
import { UISwitchComponent } from "../components/switch/switch.component";
import { FilterService } from "../services/filter.service";
import { Store } from "@ngxs/store";
import { FormArray, FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: 'sos-filter-form',
  template: `
  <form class="form-control full-width" [formGroup]="form!">
  <div class="form-input">
      <label>Métier</label>
      <options [options]="allJobs" formControlName="match_jobs"></options>
    </div>

    <div class="form-input">
      <label>Adresse de chantier</label>
      <input type="text" class="form-element" formControlName="search_address"/>
    </div>

    <div class="form-input">
      <label>Dans un rayon autour de:</label>
      <ngx-slider [options]="imports.DistanceSliderConfig" formControlName="if_$radius"></ngx-slider>
    </div>


    <div class="form-input">
      <label>Estimation de salaire:</label>
      <ngx-slider [options]="imports.SalarySliderConfig" [value]="0" [highValue]="10000" formControlName="if_amount"></ngx-slider>
    </div>


    <div class="form-input space-children-margin">
      <label>Réorganiser la liste selon</label>
      <div class="switch-container flex center-cross">
        <span class="criteria">La meilleur note à la moins bonne</span> 
        <switch class="default" formControlName="if_$notation"></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Les profils les plus complets</span> 
        <switch class="default" formControlName="if_$fullProfils"></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Les profils affichés comme disponibles</span> 
        <switch class="default" formControlName="if_$disponibleProfils"></switch>
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
export class SOSFilterForm extends Filter<Company> {
  imports = { DistanceSliderConfig, SalarySliderConfig };

  @Input('filter') name: string = 'SOS';

  @ViewChildren(UISwitchComponent)
  switches!: QueryList<UISwitchComponent>;

  @SnapshotAll('Job')
  allJobs!: Job[];

  //cancel other filters
  onSwitchClick(value: boolean, cancelIfTrue: UISwitchComponent[]) {
    if ( !value ) return;
    this.switches.forEach(item => {
      if ( cancelIfTrue.includes(item) ) {
        item.value = false;
      }
    })
  }

  constructor(service: FilterService, private store: Store) {
    super(service);
  }

  ngOnInit(): void {
    super.ngOnInit();

  this.create<{
    $radius: number;
    $notation: number;
    $fullProfils: number;
    $disponibleProfils: boolean;
  }>([
    this.match('jobs'),
    this.search('address'),
    this.onlyIf('$radius', radius => true),
    this.onlyIf('amount', (amount, range) => {
      return amount >= range[0] && amount <= range[1];
    }),
    // this.sortBy('$notation',  (a: any, b: any) => {
    //   console.log('sorting');
    //   return b['starsST'] - a['starsST'];
    // }),
    this.onlyIf('$fullProfils', fullProfils => true),
    this.onlyIf('$disponibleProfils', disponibleProfils => true),

  ]);
}

}