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
import { DistanceSliderConfig, SalarySliderConfig, EmployeesSliderConfig } from "src/app/shared/common/sliderConfig";
import { Candidate, Job, Post } from "src/models/new/data.interfaces";
import { DataQueries, SnapshotAll } from "src/models/new/data.state";
import { OptionsModel } from "../components/options/options";
import { UISwitchComponent } from "../components/switch/switch.component";
import { Filter } from "../directives/filter.directive";
import { FilterService } from "../services/filter.service";
import { getLevenshteinDistance } from "src/app/shared/services/levenshtein";
import { InfoService } from "../components/info/info.component";
import { returnInputKeyboard } from '../common/classes'
import "hammerjs"

@Component({
  selector: "st-filter-form",
  template: `
    <form class="form-control full-width" [formGroup]="filterForm">

    <div class="form-input form-spacer">
      <label>Métier</label>
      <options [options]="allJobs" formControlName="jobs"></options>
    </div>
    
      <div class="form-input">
        <label>Date de démarrage</label>
        <div class="form-input flex row space-between">
          <input type="date" style="padding-left: 0.5rem;" class="form-element" formControlName="date" #inputDateMission/>
          <img src="assets/calendar.png" (click)="inputDateMission.select()" class="img-calendar-since" style="pointer-events: none;"/>
        </div>
      </div>

      <div class="form-input">
        <label>Adresse de chantier</label>
        <input
          type="text"
          class="form-element"
          formControlName="address"
          (keyup)="returnInputKeyboard($event, inputAddress)" #inputAddress
        />
      </div>

    <div class="form-input">
      <label>Dans un rayon autour de</label>
      <ngx-slider [(value)]=valueDistance [options]="imports.DistanceSliderConfig" formControlName="radius" (userChange)="detectChanges()"></ngx-slider>

    </div>

    <div class="form-input">
        <label>Taille de l'entreprise</label>
        <ngx-slider [options]="imports.EmployeesSliderConfig" formControlName="employees" (userChange)="detectChanges()"></ngx-slider>
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
      <label>Estimation de la rémunération</label>
      <ngx-slider [options]="imports.SalarySliderConfig" [highValue]="100000" formControlName="salary" (userChange)="detectChanges()"></ngx-slider>
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
            >Date de validation de l'annonce de la plus proche à la plus
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
  checkboxValues = [true]

  imports = { DistanceSliderConfig, SalarySliderConfig, EmployeesSliderConfig };

  valueDistance: number=2000;

  @Input("filter") name: string = "ST";

  @Input()
  time: number = 0;

  @Input()
  posts: Post[] = [];

  filteredPosts: Post[] = [];

  @Output()
  filterOnST = new EventEmitter<boolean>();

  filterForm = new FormGroup({
    date: new FormControl(""),
    address: new FormControl(""),
    radius: new FormControl(2000),
    jobs: new FormControl([]),
    salary: new FormControl([0, 100000]),
    manPower: new FormControl(null),
    employees: new FormControl([0, 100]),
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

  constructor(private store: Store, private cd: ChangeDetectorRef, private filterService: FilterService, private info: InfoService) {}

  ngOnInit() {

    // this.filterForm.valueChanges.subscribe((value) => {
    //   this.updateFilteredPosts(value);
    //   this.isFilterOn(value);
    //   this.updateEvent.emit(this.filteredPosts);
    //   this.filterService.emitFilterChangeEvent(this.filteredPosts)
    // });

  }

  updateFilteredPosts(filter: any) {
    this.filteredPosts = [];
    const user = this.store.selectSnapshot(DataQueries.currentUser);
    const now = new Date().toISOString().slice(0, 10);
    let allPosts = this.posts.filter((post) => post.dueDate > now)

    // Filter
    for (let post of allPosts) {
      const company = this.store.selectSnapshot(DataQueries.getById('Company', post.company))!;
      const profile = this.store.selectSnapshot(DataQueries.currentProfile);

      // Pour ne pas voir nos propres annonces dans BOTH
      let isSameCompany = (post.company == profile.company.id)
      
      //Date de mission
      let isDifferentDate = (filter.date && post.startDate < filter.date)

      //Radius
      let userCompany: any = this.store.selectSnapshot(DataQueries.getById("Company", user.company));
      let userLatitude = userCompany.latitude*(Math.PI/180);
      let userLongitude = userCompany.longitude*(Math.PI/180);
      let postLatitude = post.latitude*(Math.PI/180);
      let postLongitude = post.longitude*(Math.PI/180);
      let distance = 6371*Math.acos(Math.sin(userLatitude)*Math.sin(postLatitude) + Math.cos(userLatitude)*Math.cos(postLatitude)*Math.cos(postLongitude-userLongitude))

      let isNotInRadius = ((filter.radius || filter.radius == 0) && distance > filter.radius)

      //Manpower
      let isDifferentManPower = (filter.manPower && post.manPower != (filter.manPower === "true"))

      //Job
      let isNotIncludedJob = (filter.jobs && filter.jobs.length && filter.jobs.every((job: any) => {return job.id != post.job}))
      
      //Salary
      let isNotInRangeSalary = false;
      if (filter.salary[0] != SalarySliderConfig.floor || filter.salary[1] != SalarySliderConfig.ceil){
        isNotInRangeSalary = (post.amount < filter.salary[0] || post.amount > filter.salary[1])
      }

      //Employees
      const jobsForCompany = this.store.selectSnapshot(DataQueries.getMany('JobForCompany', company.jobs));
      let count = jobsForCompany.reduce((acc, {number}) => acc + number, 0);
      let isNotInRangeEmployees = filter.employees[0] >= count || (filter.employees[1] != 100 && filter.employees[1] <= count);


      //Favorite
      let isNotFavorite = (filter.favorite && !user.favoritePosts.includes(post.id));

      //Candidate
      let candidates = this.store.selectSnapshot(DataQueries.getMany("Candidate", post.candidates))
      let companies = candidates.map(candidate => candidate.company)
      let isNotCandidate = (filter.candidate && !companies.includes(user.company));

      //Viewed
      let isNotViewed = (filter.viewed && !user.viewedPosts.includes(post.id) && !companies.includes(user.company));

      //CounterOffer
      let isNotCounterOffer = (filter.counterOffer && !post.counterOffer);
      
      if ( isSameCompany ||
          isDifferentDate || 
          isDifferentManPower || 
          isNotIncludedJob || 
          isNotInRadius || 
          isNotInRangeSalary || 
          isNotViewed ||
          isNotFavorite ||
          isNotCandidate ||
          isNotCounterOffer ||
          isNotInRangeEmployees
          ) { continue }

      this.filteredPosts.push(post)
    }

    // Sort

    // is Viewed
    this.filteredPosts.sort((post1, post2) => {
      let p1 = user.viewedPosts.includes(post1.id)  ? 1: 0;
      let p2 = user.viewedPosts.includes(post2.id)  ? 1 : 0;
      return p1-p2
    })

    // HAs postulated
    this.filteredPosts.sort((post1, post2) => {
      let candidate1 = this.store.selectSnapshot(DataQueries.getMany("Candidate", post1.candidates))
      let company1 = candidate1.map(candidate => candidate.company)
      let candidate2 = this.store.selectSnapshot(DataQueries.getMany("Candidate", post2.candidates))
      let company2 = candidate2.map(candidate => candidate.company)
      let p1 = company1.includes(user.company) ? 1: 0;
      let p2 = company2.includes(user.company) ? 1 : 0;
      return p1-p2
    })

    //Boosted post
    this.filteredPosts.sort((post1, post2) => {
      let b1 = post1.boostTimestamp > this.time ? 1 : 0;
      let b2 = post2.boostTimestamp > this.time ? 1 : 0;
      return b2 - b1
    })
    //Address
    // Array qui contiendra les posts et leur valeur en distance Levenshtein pour une adresse demandée
    let levenshteinDist: any = [];
    if (filter.address) {
      for (let post of this.filteredPosts) {levenshteinDist.push([post,getLevenshteinDistance(post.address.toLowerCase(),filter.address.toLowerCase()),]);}
      levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
      let keys = levenshteinDist.map((key: any) => {
        return key[0];
      });
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
        return b["id"] - a["id"];
      });
    }

    this.cd.markForCheck();
  }

  updatePosts(posts: Post[]) {
    this.posts = posts
    this.updateFilteredPosts(this.filterForm.value);
    this.updateEvent.emit(this.filteredPosts);
    this.filterService.emitFilterChangeEvent(this.filteredPosts)
  }
  
  arrayEquals(a: any[], b: any[]) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }

  isFilterOn(filter: any){
    if (filter.address == "" && filter.date == "" && filter.jobs.length == 0 && filter.manPower == null && filter.candidate == false && filter.counterOffer == false &&  filter.dueDateSort == false && this.arrayEquals(filter.employees, [0,100]) && this.arrayEquals(filter.salary, [0, 100000]) && filter.favorite == false && filter.radius == 2000 && filter.startDateSort == false && filter.viewed == false){
      this.filterOnST.emit(false)
    } else {
      this.filterOnST.emit(true);
      this.info.show("info","Vos filtres ont été appliqués", 3000);
    }
    this.cd.markForCheck;
  }

  // resetFilter(){
  //   this.filterForm.reset();
  //   this.filterForm.get('radius')?.setValue(2000)
  // }

  detectChanges() {
    this.cd.detectChanges();
  }

  returnInputKeyboard = returnInputKeyboard
  
}

