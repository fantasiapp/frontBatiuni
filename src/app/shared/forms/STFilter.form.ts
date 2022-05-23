import { Options } from "@angular-slider/ngx-slider";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { Store } from "@ngxs/store";
import { Control } from "mapbox-gl";
import { DistanceSliderConfig, SalarySliderConfig } from "src/app/shared/common/config";
import { Candidate, Job, Post } from "src/models/new/data.interfaces";
import { DataQueries, SnapshotAll } from "src/models/new/data.state";
import { OptionsModel } from "../components/options/options";
import { UISwitchComponent } from "../components/switch/switch.component";
import { Filter } from "../directives/filter.directive";
import { FilterService } from "../services/filter.service";
import { getLevenshteinDistance } from "src/app/shared/services/levenshtein";

@Component({
  selector: "st-filter-form",
  template: `
    <form class="form-control full-width" [formGroup]="filterForm">
      <div class="form-input">
        <label>Date de mission</label>
        <input
          type="date"
          class="form-element"
          formControlName="date"
        />
        <img src="assets/calendar.png" />
      </div>

      <div class="form-input">
        <label>Adresse de chantier</label>
        <input
          type="text"
          class="form-element"
          formControlName="address"
        />
      </div>

    <div class="form-input">
      <label>Dans un rayon autour de</label>
      <ngx-slider [(value)]=valueDistance [options]="imports.DistanceSliderConfig" formControlName="radius"></ngx-slider>
    </div>

    <div class="form-input form-spacer">
      <label>Métier</label>
      <options [options]="allJobs" formControlName="jobs"></options>
    </div>

    <div class="form-input form-spacer">
      <label class="form-title">Type</label>
        <div class="flex row radio-container">
          <div class="radio-item">
            <radiobox class="grow" hostName=manPower onselect="true" name="job-type" formControlName="manPower" #manPower1></radiobox>
            <span (click)="manPower1.onChange($event)">Main d'oeuvre</span>
          </div>
          <div class="radio-item">
            <radiobox class="grow" hostName=manPower onselect="false" name="job-type" formControlName="manPower" #manPower2></radiobox>
            <span (click)="manPower2.onChange($event)">Fourniture et pose</span>
          </div>
        </div>
    </div>


    <div class="form-input">
      <label>Estimation de la rémunération horaire</label>
      <ngx-slider [options]="imports.SalarySliderConfig" [highValue]="400" formControlName="salary"></ngx-slider>
    </div>

      <div class="form-input space-children-margin">
        <ng-container formArrayName="employees">
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
            <span>Entre 20 et 50 salariés</span>
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
        <label class="form-title">Réorganiser la liste selon</label>
        <div class="switch-container flex center-cross">
          <span class="criteria">Annonces déjà vues uniquement</span>
          <switch class="default" formControlName="viewed"></switch>
        </div>
        <div class="switch-container flex center-cross">
          <span class="criteria">Annonces favorites uniquement</span>
          <switch class="default" formControlName="favorite"></switch>
        </div>
        <div class="switch-container flex center-cross">
          <span class="criteria">Annonces déjà postulées uniquement</span>
          <switch class="default" formControlName="candidate"></switch>
        </div>
        <div class="switch-container flex center-cross">
          <span class="criteria">Annonces ouvertes à une contre-proposition</span>
          <switch class="default" formControlName="counterOffer"></switch>
        </div>
        <div class="switch-container flex center-cross">
          <span class="criteria"
            >Date d'échéance de l'annonce de la plus proche à la plus
            lointaine</span
          >
          <switch
            class="default"
            (valueChange)="onSwitchClick($event, [switch2])"
            formControlName="dueDateSort"
            #switch1
          ></switch>
        </div>
        <div class="switch-container flex center-cross">
          <span class="criteria"
            >Date de publication de la plus récente à la plus ancienne</span
          >
          <switch
            class="default"
            (valueChange)="onSwitchClick($event, [switch1])"
            formControlName="startDateSort"
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
export class STFilterForm {
  imports = { DistanceSliderConfig, SalarySliderConfig };

  valueDistance: number=1000;

  @Input("filter") name: string = "ST";

  @Input()
  time: number = 0;

  @Input()
  posts: Post[] = [];

  filteredPosts: Post[] = [];

  filterForm = new FormGroup({
    date: new FormControl(""),
    address: new FormControl(""),
    radius: new FormControl(1000),
    jobs: new FormControl([]),
    salary: new FormControl(0),
    manPower: new FormControl(null),
    employees: new FormArray([
      new FormControl(true),
      new FormControl(true),
      new FormControl(true),
      new FormControl(true),
      new FormControl(true),
    ]),
    viewed: new FormControl(false),
    favorite: new FormControl(false),
    candidate: new FormControl(false),
    counterOffer: new FormControl(false),
    dueDateSort: new FormControl(false),
    startDateSort: new FormControl(false),
  });

  @Output('update')
  updateEvent = new EventEmitter();

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
        cancelIfTrue[0].value = false;
        this.cd.markForCheck();
      }
    });
  }

  constructor(service: FilterService, private store: Store, private cd: ChangeDetectorRef) {}

  ngOnInit() {

    this.filterForm.valueChanges.subscribe((value) => {
      this.updateFilteredPosts(value);
      this.updateEvent.emit(this.filteredPosts);
    });

  }

  updateFilteredPosts(filter: any) {
    this.filteredPosts = [];
    
    const user = this.store.selectSnapshot(DataQueries.currentUser);

    // Filter
    for (let post of this.posts) {

      const company = this.store.selectSnapshot(DataQueries.getById('Company', post.company))!;

      //Date
      let datesPost = this.store.selectSnapshot(DataQueries.getMany("DatePost", post.dates));
      let dates = datesPost.map(date => date.date);
      let isDifferentDate = (filter.date && !dates.includes(filter.date))

      //Radius
      let userCompany: any = this.store.selectSnapshot(DataQueries.getById("Company", user.company));
      let userLatitude = userCompany.latitude*(Math.PI/180);
      let userLongitude = userCompany.longitude*(Math.PI/180);
      let postLatitude = post.latitude*(Math.PI/180);
      let postLongitude = post.longitude*(Math.PI/180);
      let distance = 6371*Math.acos(Math.sin(userLatitude)*Math.sin(postLatitude) + Math.cos(userLatitude)*Math.cos(postLatitude)*Math.cos(postLongitude-userLongitude))

      let isNotInRadius = (distance > filter.radius)

      //Manpower
      let isDifferentManPower = (filter.manPower && post.manPower != (filter.manPower === "true"))

      //Job
      let isNotIncludedJob = (filter.jobs && filter.jobs.length && filter.jobs.every((job: any) => {return job.id != post.job}))
      
      //Salary
      let isNotInRangeSalary = (filter.salary && (company.amount < filter.salary[0] || company.amount > filter.salary[1]))

      //Employees
      const jobsForCompany = this.store.selectSnapshot(DataQueries.getMany('JobForCompany', company.jobs));
      let count = jobsForCompany.reduce((acc, {number}) => acc + number, 0);
      let isNotBetween1And10 = (!filter.employees[0] && (count >= 1 && count <= 10))
      let isNotBetween11And20 = (!filter.employees[1] && (count >= 11 && count <= 20))
      let isNotBetween21And50 = (!filter.employees[2] && (count >= 21 && count <= 50))
      let isNotBetween51And100 = (!filter.employees[3] && (count >= 51 && count <= 100))
      let isNotMoreThan100 = (!filter.employees[4] && count > 100)

      //Viewed
      let isNotViewed = (filter.viewed && !user.viewedPosts.includes(post.id));

      //Favorite
      let isNotFavorite = (filter.favorite && !user.favoritePosts.includes(post.id));

      //Candidate
      let candidates = this.store.selectSnapshot(DataQueries.getMany("Candidate", post.candidates))
      let companies = candidates.map(candidate => candidate.company)
      let isNotCandidate = (filter.candidate && !companies.includes(user.company));

      //CounterOffer
      let isNotCounterOffer = (filter.counterOffer && !post.counterOffer);
      
      if ( isDifferentDate || 
          isDifferentManPower || 
          isNotIncludedJob || 
          isNotInRadius || 
          isNotInRangeSalary || 
          isNotViewed ||
          isNotFavorite ||
          isNotCandidate ||
          isNotCounterOffer ||
          isNotBetween1And10 ||
          isNotBetween11And20 ||
          isNotBetween21And50 ||
          isNotBetween51And100 ||
          isNotMoreThan100
          ) { continue }

      this.filteredPosts.push(post)
    }

    // Sort

    //Boosted post

    //Address
    // Array qui contiendra les posts et leur valeur en distance Levenshtein pour une adresse demandée
    let levenshteinDist: any = [];
    if (filter.address) {
      for (let post of this.filteredPosts) {levenshteinDist.push([post,getLevenshteinDistance(post.address.toLowerCase(),filter.address.toLowerCase()),]);}
      levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
      let keys = levenshteinDist.map((key: any) => {
        return key[0];
      });
      console.log("levenshteinDist", levenshteinDist);
      // On trie les posts selon leur distance de levenshtein
      this.filteredPosts.sort(
        (a: any, b: any) => keys.indexOf(a) - keys.indexOf(b)
      );
    } 
    
    //dueDate
    if (filter.dueDateSort) {
      this.filteredPosts.sort((a: any, b: any) => {
        let aDate = a.dueDate;
        let bDate = b.dueDate;
        if (aDate < bDate) {
          return -1;
        } else if (aDate > bDate) {
          return 1;
        } else {
          return 0;
        }
      });
    }


    //startDate
    if (filter.startDateSort) {
      this.filteredPosts.sort((a, b) => {
        return a["id"] - b["id"];
      });
    }

    
    this.cd.markForCheck();
  }
}

