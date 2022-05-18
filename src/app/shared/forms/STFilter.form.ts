import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { FormArray, FormGroup } from "@angular/forms";
import { Store } from "@ngxs/store";
import { Control } from "mapbox-gl";
import { DistanceSliderConfig, SalarySliderConfig } from "src/app/shared/common/config";
import { Job, Post } from "src/models/new/data.interfaces";
import { DataQueries, SnapshotAll } from "src/models/new/data.state";
import { OptionsModel } from "../components/options/options";
import { UISwitchComponent } from "../components/switch/switch.component";
import { Filter } from "../directives/filter.directive";
import { FilterService } from "../services/filter.service";

@Component({
  selector: "st-filter-form",
  template: `
    <form class="form-control full-width" [formGroup]="form!">
      <div class="form-input">
        <label>Date de mission</label>
        <input
          type="date"
          class="form-element"
          formControlName="match_dueDate"
        />
        <img src="assets/calendar.png" />
      </div>

      <div class="form-input">
        <label>Adresse de chantier</label>
        <input
          type="text"
          class="form-element"
          formControlName="search_address"
        />
      </div>

    <div class="form-input">
      <label>Dans un rayon autour de:</label>
      <ngx-slider [options]="imports.DistanceSliderConfig" [value]="0" [highValue]="1000" formControlName="if_$radius"></ngx-slider>
    </div>

    <div class="form-input form-spacer">
      <label>Métier</label>
      <options [options]="allJobs" formControlName="inList_job"></options>
    </div>

    <div class="form-input form-spacer">
      <label class="form-title">Type</label>
        <div class="flex row radio-container">
          <div class="radio-item">
            <radiobox class="grow" onselect="true" name="job-type" formControlName="if_$manPower1" #manPower1></radiobox>
            <span (click)="manPower1.onChange($event)">Main d'oeuvre</span>
          </div>
          <div class="radio-item">
            <radiobox class="grow" onselect="false" name="job-type" formControlName="if_$manPower2" #manPower2></radiobox>
            <span (click)="manPower2.onChange($event)">Fourniture et pose</span>
          </div>
        </div>
    </div>


    <div class="form-input">
      <label>Estimation de salaire:</label>
      <ngx-slider [options]="imports.SalarySliderConfig" [value]="0" [highValue]="100000" formControlName="if_amount"></ngx-slider>
    </div>

      <div class="form-input space-children-margin">
        <ng-container formArrayName="some_employee">
        <label class="form-title">Taille de l'entreprise</label>
          <div class="radio-item">
            <checkbox
              class="grow"
              [value]="true"
              formControlName="0"
            ></checkbox>
            <span>Moins de 10 salariés</span>
          </div>
          <div class="radio-item">
            <checkbox
              class="grow"
              [value]="true"
              [formControlName]="'1'"
            ></checkbox>
            <span>Entre 11 et 20 salariés</span>
          </div>
          <div class="radio-item">
            <checkbox
              class="grow"
              [value]="true"
              [formControlName]="'2'"
            ></checkbox>
            <span>Entre 20 et 50 salariées</span>
          </div>
          <div class="radio-item">
            <checkbox
              class="grow"
              [value]="true"
              [formControlName]="'3'"
            ></checkbox>
            <span>Entre 50 et 100 salariés</span>
          </div>
          <div class="radio-item">
            <checkbox
              class="grow"
              [value]="true"
              [formControlName]="'4'"
            ></checkbox>
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
          <span class="criteria"
            >Date d'échéance de l'annonce de la plus proche à la plus
            lointaine</span
          >
          <switch
            class="default"
            (valueChange)="onSwitchClick($event, [switch2])"
            formControlName="sort_dueDate"
            #switch1
          ></switch>
        </div>
        <div class="switch-container flex center-cross">
          <span class="criteria"
            >Date de publication la plus récente à la plus anciennce</span
          >
          <switch
            class="default"
            (valueChange)="onSwitchClick($event, [switch1])"
            formControlName="sort_startDate"
            #switch2
          ></switch>
        </div>
      </div>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      switch::ng-deep .slider {
        background: #ccc;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
//save computed properties
export class STFilterForm extends Filter<Post> {
  imports = { DistanceSliderConfig, SalarySliderConfig };

  @Input("filter") name: string = "ST";

  @ViewChildren(UISwitchComponent)
  switches!: QueryList<UISwitchComponent>;

  @SnapshotAll('Job')
  allJobs!: Job[];

  @ViewChild('job')
  options!: OptionsModel;

  //cancel other filters
  onSwitchClick(value: boolean, cancelIfTrue: UISwitchComponent[]) {
    if (!value) return;
    this.switches.forEach((item) => {
      if (cancelIfTrue.includes(item)) {
        item.value = false;
      }
    });
  }

  constructor(service: FilterService, private store: Store) {
    super(service);
  }

  ngOnInit(): void {
    super.ngOnInit();

    //either precompute with defineComputedProperty
    //or evaluate during the function call
    
    this.create<{
      // $job: boolean;
      $jobId: number;
      $manPower1: boolean;
      $manPower2: boolean;
      $favorite: boolean;
      $viewed: boolean;
      $candidate: boolean;
      $employeeCount: number;
      $radius: number;
    }>([
      this.defineComputedProperty('$manPower1', (post) => {
        return post.manPower;
      }),
      this.defineComputedProperty('$manPower2', (post) => {
        return post.manPower;
      }),
      this.defineComputedProperty('$employeeCount', (post) => {
        const company = this.store.selectSnapshot(DataQueries.getById('Company', post.company))!,
        jobsForCompany = this.store.selectSnapshot(DataQueries.getMany('JobForCompany', company.jobs));
        return jobsForCompany.reduce((acc, {number}) => acc + number, 0);
      }),
      this.defineComputedProperty("$favorite", (post) => {
        const user = this.store.selectSnapshot(DataQueries.currentUser);
        return user.favoritePosts.includes(post.id);
      }),
      this.defineComputedProperty("$viewed", (post) => {
        const user = this.store.selectSnapshot(DataQueries.currentUser);
        return user.viewedPosts.includes(post.id);
      }),
      this.defineComputedProperty('$candidate', (post) => {
        const user = this.store.selectSnapshot(DataQueries.currentUser);
        let candidates = this.store.selectSnapshot(DataQueries.getMany("Candidate", post.candidates))
        let companies = candidates.map(candidate => candidate.company)
        return companies.includes(user.company);
      }),
      this.defineComputedProperty('$radius', (post) => {
        const user = this.store.selectSnapshot(DataQueries.currentUser);
        let userCompany: any = this.store.selectSnapshot(DataQueries.getById("Company", user.company));
        let userLatitude = userCompany.latitude*(Math.PI/180);
        let userLongitude = userCompany.longitude*(Math.PI/180);
        let postLatitude = post.latitude*(Math.PI/180);
        let postLongitude = post.longitude*(Math.PI/180);
        let distance = 6371*Math.acos(Math.sin(userLatitude)*Math.sin(postLatitude) + Math.cos(userLatitude)*Math.cos(postLatitude)*Math.cos(postLongitude-userLongitude))
        return distance ;
      }),

      this.match('dueDate'),  
      this.search('address'),
      this.onlyIf('$radius', (radius, range) => {
        return radius >= range[0] && radius <= range[1];
      }),
      this.inList('job', (job) => { return job.id }),
      this.onlyIf('$manPower1', manPower1 => { return manPower1 }),
      this.onlyIf('$manPower2', manPower2 => { return !manPower2 }),
      this.onlyIf('amount', (amount, range) => {
        return amount >= range[0] && amount <= range[1];
      }),
      this.some('employee',
      this.onlyIf("$employeeCount", (count) => 1 <= count && count <= 10, [], true),
      this.onlyIf("$employeeCount", (count) => count > 10 && count <= 25, [], true),
      this.onlyIf("$employeeCount", (count) => count > 25 && count <= 50, [], true),
      this.onlyIf("$employeeCount", (count) => count > 50 && count <= 100, [], true),
      this.onlyIf("$employeeCount", (count) => count > 100, [], true)
      ),
      this.onlyIf('$viewed', viewed => { return viewed }),
      this.onlyIf('$favorite', favorite => { return favorite }),
      this.onlyIf('$candidate', candidate => { return candidate }),
      this.onlyIf('counterOffer', counterOffer => counterOffer),
      this.sortBy('dueDate', (d1, d2) => {
        return new Date(d1).getTime() - new Date(d2).getTime();
      }),
      this.sortBy("startDate", () => 1),
    ]);

   console.log(this);
  }

}
