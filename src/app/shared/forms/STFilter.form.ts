import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, QueryList, ViewChildren } from "@angular/core";
import { FormArray, FormGroup } from "@angular/forms";
import { Store } from "@ngxs/store";
import { DistanceSliderConfig, SalarySliderConfig } from "src/app/shared/common/config";
import { Post } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";
import { UISwitchComponent } from "../components/switch/switch.component";
import { Filter } from "../directives/filter.directive";
import { FilterService } from "../services/filter.service";


@Component({
  selector: 'st-filter-form',
  template: `
  <form class="form-control full-width" [formGroup]="form!">
    <div class="form-input">
      <label>Date de mission</label>
      <input type="date" class="form-element" formControlName="match_dueDate"/>
      <img src="assets/calendar.png"/>
    </div>

    <div class="form-input">
      <label>Adresse de chantier</label>
      <input type="text" class="form-element" formControlName="match_address"/>
    </div>

    <div class="form-input">
      <label>Dans un rayon autour de:</label>
      <ngx-slider [options]="imports.DistanceSliderConfig" formControlName="if_$radius"></ngx-slider>
    </div>

    <div class="form-input">
      <label>Estimation de salaire:</label>
      <ngx-slider [options]="imports.SalarySliderConfig" [value]="0" [highValue]="100000" formControlName="if_amount"></ngx-slider>
    </div>

    <div class="form-input space-children-margin">
      <label>Taille de l'entreprise</label>
      <ng-container formArrayName="some_employee">
        <div class="radio-item">
          <checkbox class="grow" name="job-type" [formControlName]="0"></checkbox>
          <span>Moins que 10 salariés</span>
        </div>
        <div class="radio-item">
          <checkbox class="grow" name="job-type" [formControlName]="1"></checkbox>
          <span>Entre 11 et 20 salariés</span>
        </div>
        <div class="radio-item">
          <checkbox class="grow" name="job-type" [formControlName]="2"></checkbox>
          <span>Entre 20 et 25 salariées</span>
        </div>
        <div class="radio-item">
          <checkbox class="grow" name="job-type" [formControlName]="3"></checkbox>
          <span>Entre 50 et 100 salariés</span>
        </div>
        <div class="radio-item">
          <checkbox class="grow" name="job-type" [formControlName]="4"></checkbox>
          <span>Plus de 100 salariés</span>
        </div>
      </ng-container>
    </div>

    <div class="form-input space-children-margin">
      <label>Réorganiser la liste selon</label>
      <div class="switch-container flex center-cross">
        <span class="criteria">Annonces déjà vus uniquement</span>
        <switch class="default" formControlName="if_$viewed"></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Annonces favoristes uniquement</span>
        <switch class="default" formControlName="if_$favorite"></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Annonces déjà postulées uniquement</span>
        <switch class="default" formControlName="if_$candidate"></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Annonces ouverte à contre-proposition</span>
        <switch class="default" formControlName="if_counterOffer"></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Date d'échéance de l'annonce de la plus proche à la plus lointaine</span>
        <switch class="default" (valueChange)="onSwitchClick($event, [switch2])" formControlName="sort_dueDate" #switch1></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Date de publication la plus récente à la plus anciennce</span>
        <switch class="default" (valueChange)="onSwitchClick($event, [switch1])" formControlName="sort_startDate" #switch2></switch>
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
export class STFilterForm extends Filter<Post> {
  imports = { DistanceSliderConfig, SalarySliderConfig };

  @Input('filter') name: string = 'ST';

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

  constructor(service: FilterService, private store: Store) {
    super(service);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.create<{
      $favorite: boolean;
      $viewed: boolean;
      $candidate: boolean;
      $employeeCount: number;
      $radius: number;
    }>([
      this.defineComputedProperty('$employeeCount', (post) => {
        const company = this.store.selectSnapshot(DataQueries.getById('Company', post.company))!,
          jobsForCompany = this.store.selectSnapshot(DataQueries.getMany('JobForCompany', company.jobs));
        return jobsForCompany.reduce((acc, {number}) => acc + number, 0);
      }),
      this.defineComputedProperty('$favorite', (post) => {
        const user = this.store.selectSnapshot(DataQueries.currentUser);
        return user.favoritePosts.includes(post.id);
      }),
      this.defineComputedProperty('$viewed', (post) => {
        const user = this.store.selectSnapshot(DataQueries.currentUser);
        return user.viewedPosts.includes(post.id);
      }),
      this.match('dueDate'),
      this.match('address'),
      this.some(
        'employee',
        this.onlyIf('$employeeCount', count => 1 <= count && count <= 10, [], true),
        this.onlyIf('$employeeCount', count => count > 10 && count <= 25, [], true),
        this.onlyIf('$employeeCount', count => count > 25 && count <= 50, [], true),
        this.onlyIf('$employeeCount', count => count > 50 && count <= 100, [], true),
        this.onlyIf('$employeeCount', count => count > 100, [], true),
      ),
      this.onlyIf('$viewed', viewed => viewed),
      this.onlyIf('$favorite', favorite => favorite),
      this.onlyIf('$candidate', candidate => candidate),
      this.onlyIf('counterOffer', counterOffer => counterOffer),
      this.onlyIf('$radius', radius => true),
      this.onlyIf('amount', (amount, range) => {
        return amount >= range[0] && amount <= range[1];
      }),
      this.sortBy('dueDate', (d1, d2) => {
        console.log('sorting');
        return new Date(d1).getTime() - new Date(d2).getTime();
      }),
      this.sortBy('startDate', () => 1)
    ]);

    //initialize
    (this.form.controls['some_employee'] as FormArray).controls[0].setValue(1);
  }
}