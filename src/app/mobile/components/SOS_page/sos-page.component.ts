import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { combineLatest, Observable, of } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";
import { AppComponent } from "src/app/app.component";
import { Destroy$ } from "src/app/shared/common/classes";
import { DistanceSliderConfig, SOSSalarySliderConfig } from "src/app/shared/common/sliderConfig";
import { splitByOutput } from "src/app/shared/common/functions";
import { Availability } from "src/app/shared/components/calendar/calendar.ui";
import { ExtendedProfileComponent } from "src/app/shared/components/extended-profile/extended-profile.component";
import { InfoService } from "src/app/shared/components/info/info.component";
import { MarkerType } from "src/app/shared/components/map/map.component";
import { SearchbarComponent } from "src/app/shared/components/searchbar/searchbar.component";
import { SlidemenuService } from "src/app/shared/components/slidemenu/slidemenu.component";
import { FilterService } from "src/app/shared/services/filter.service";
import { getUserDataService } from "src/app/shared/services/getUserData.service";
import { getLevenshteinDistance } from "src/app/shared/services/levenshtein";
import { File, Company, Profile } from "src/models/new/data.interfaces";
import {
  availabilityToName,
  nameToAvailability,
} from "src/models/new/data.mapper";
import { DataQueries, Query, QueryAll } from "src/models/new/data.state";

export interface availableCompanies {
  company: Company,
  availability: MarkerType
}

@Component({
  selector: "sos-page",
  templateUrl: "sos-page.component.html",
  styleUrls: ["sos-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SOSPageComponent extends Destroy$ {
  imports = { DistanceSliderConfig, SOSSalarySliderConfig };

  activeView: number = 0;
  openSOSFilterMenu: boolean = false;
  allAvailableCompanies: Company[] = [];
  availableCompanies: availableCompanies[] = []
  companies: Company[] = [];
  availabilities: MarkerType[] = [];
  filterOn: boolean = false;

  searchbar!: SearchbarComponent;

  @QueryAll("Company")
  companies$!: Observable<Company[]>;

  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  constructor(
    private store: Store, 
    private slides: SlidemenuService, 
    private info: InfoService, 
    private appComponent: AppComponent, 
    private cd: ChangeDetectorRef,
    private getUserDataService: getUserDataService
  ) {
    super();
    this.searchbar = new SearchbarComponent(store);
  }

  ngOnInit() {
    this.info.alignWith('header_search');
    const now = new Date().toISOString().slice(0, 10);
    this.companies$.subscribe((companies) => {
      for (const company of companies) {
        const ownAvailabilities = this.store.selectSnapshot(DataQueries.getMany("Disponibility", company.availabilities));
        for (const day of ownAvailabilities) {
          if (day.date == now) {
            this.allAvailableCompanies.push(company);
            continue;
          }
        } 
      }
    })      
    this.cd.markForCheck;
    this.selectCompany(null);
  }

  ngAfterViewInit() {
  }

  callbackFilter = (filter: any): void => {
    this.selectCompany(filter);
    this.isFilterOn(filter);
  };

  selectSearchDraft(searchForm:  string){
    this.availableCompanies = [];
    if (searchForm == "" || searchForm == null)  {
      for (const company of this.allAvailableCompanies) {
        this.isCompanyAvailable(company)
      }
    } else {
      let levenshteinDist: any = [];
      for (let company of this.allAvailableCompanies) {
        let postString = this.searchbar.companyToString(company)
        levenshteinDist.push([company,getLevenshteinDistance(postString.toLowerCase(),searchForm.toLowerCase()),]);
      }
      levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
      let keys = levenshteinDist.map((key: any) => { return key[0]; });
      this.allAvailableCompanies.sort((a: any,b: any)=>keys.indexOf(a) - keys.indexOf(b));
      for (let company of this.allAvailableCompanies){
        this.isCompanyAvailable(company)
      }
    }
    this.companies = this.availableCompanies.map(companyAvailable => companyAvailable.company);
    this.availabilities = this.availableCompanies.map(companyAvailable => companyAvailable.availability);
    this.cd.markForCheck();
  }


  callbackSearch = (search: any): void => {
    this.selectSearchDraft(search)
  };

  isCompanyAvailable(company: Company){
    const now = new Date().toISOString().slice(0, 10);
    const ownAvailabilities = this.store.selectSnapshot(DataQueries.getMany("Disponibility", company.availabilities));
    for (const day of ownAvailabilities) {
      if (day.date == now) {
        this.availableCompanies.push({
          company: company,
          availability: nameToAvailability(day.nature as any)
        })
        continue;
      }
    } 
  }

  arrayEquals(a: any[], b: any[]) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }

  isFilterOn(filter: any){
    console.log(filter)
    if (filter.address == "" && this.arrayEquals(filter.amount, [0, 400]) && filter.jobs.length == 0 && filter.radius == 2000 && filter.sortDisponibleProfils == false && filter.sortFullProfils == false && filter.sortNotation == false){
      this.filterOn = false;
    } else {
      this.filterOn = true;
    }
  }

  selectCompany(filter: any) {
    this.availableCompanies = []
    if (filter == null) { 
      for (const company of this.allAvailableCompanies) {
        this.isCompanyAvailable(company)
      }
    } else {
      // Trie les posts selon leur distance de levenshtein
      let levenshteinDist: any = [];
      if (filter.address != "") {
        for (let company of this.allAvailableCompanies) {levenshteinDist.push([company,getLevenshteinDistance(company.address.toLowerCase(), filter.address.toLowerCase())]);}
        levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
        let keys = levenshteinDist.map((key: any) => {return key[0];});
        this.allAvailableCompanies.sort((a: any,b: any)=>keys.indexOf(a) - keys.indexOf(b));
      } 

      // Trie les companies selon leurs notes
      if (filter.sortNotation === true) {this.allAvailableCompanies.sort((a: any, b: any) => b['starsST'] - a['starsST'])} 

      // Trie les companies les plus complètes
      if (filter.sortFullProfils === true) {
        let completedCompanies: any = []; 
        for (let company of this.allAvailableCompanies){
          const files: (File | null)[] = company.files?.map(fileId => this.store.selectSnapshot(DataQueries.getById('File', fileId)))
          const filesName = files.map(file => {if (file) { return file.name} return null })
          const checkFile = ["URSSAF", "Kbis", "Trav. Dis", "Impôts", "Congés Payés"].map(name => filesName.includes(name))
          const filesNature = files.map(file => { if (file) { return file.nature } return null })
          const levelStart = company.amount && company.address && company.companyPhone && company.siret && company.jobs
          let step = 0
          if (levelStart) { step = 1 }
          if (filesNature.includes("labels")) { step = 2 }
          if (levelStart && filesNature.includes("labels")) { step = 3}
          if (levelStart && !checkFile.includes(false)) { step = 4 }
          if (levelStart && !checkFile.includes(false) && filesNature.includes("labels")) { step = 5 }
          completedCompanies.push([company, step])
        }
        completedCompanies.sort((a: number[], b: number[]) => b[1] - a[1]);
        let companyKeys = completedCompanies.map((key: any) => {return key[0]});
        this.allAvailableCompanies.sort((a: any, b: any) => companyKeys.indexOf(a) - companyKeys.indexOf(b));
      }      

      for (let company of this.allAvailableCompanies) {

        let includedJob = false;
        if (filter.jobs){
          let Jobs = this.store.selectSnapshot(DataQueries.getMany("JobForCompany", company.jobs));
          let companyJob = Jobs.map(job => job.job);
          let filterJobs = filter.jobs.map((job: { id: any; }) => job.id);
          for (let id of companyJob) { if (filterJobs.includes(id)){ includedJob = true}}
        }
        let isNotIncludedJob = (filter.jobs && filter.jobs.length && !includedJob)

        let isNotRightAmount = (filter.amount && company.amount && (company.amount < filter.amount[0] || company.amount > filter.amount[1]))
        
        const user = this.store.selectSnapshot(DataQueries.currentUser);
        let userCompany: any = this.store.selectSnapshot(DataQueries.getById("Company", user.company));
        let userLatitude = userCompany.latitude*(Math.PI/180);
        let userLongitude = userCompany.longitude*(Math.PI/180);
        let postLatitude = company.latitude*(Math.PI/180);
        let postLongitude = company.longitude*(Math.PI/180);
        let distance = 6371*Math.acos(Math.sin(userLatitude)*Math.sin(postLatitude) + Math.cos(userLatitude)*Math.cos(postLatitude)*Math.cos(postLongitude-userLongitude))
        let isNotRightRadius = (filter.radius != 2000 && distance > filter.radius)

        let available = false;
        let today = new Date().toISOString().slice(0, 10)
        let disponibility = this.store.selectSnapshot(DataQueries.getMany("Disponibility", company.availabilities));
        let disponibilityToday = disponibility.filter(dispo => dispo.date == today)
        let availableToday =  disponibilityToday.map(dispo => dispo.nature)
        if (availableToday[0] === "Disponible") { available = true}
        let isNotDisponible = (filter.sortDisponibleProfils && !available)

        if (isNotRightAmount || isNotRightRadius || isNotIncludedJob || isNotDisponible) {continue}
        this.isCompanyAvailable(company)
      }
    }
    this.companies = this.availableCompanies.map(companyAvailable => companyAvailable.company);
    this.availabilities = this.availableCompanies.map(companyAvailable => companyAvailable.availability);
    this.cd.markForCheck();
  }

  checkCompanyProfile(company: Company) {
    this.slides.show(company.name, {
      type: "component",
      component: ExtendedProfileComponent,
      init: (component: ExtendedProfileComponent) => {
        component.profile$ = { company: company, user: null };
        component.showContact = true;
        component.showView = "ST";
        component.showSwitch = false;
        component.showRecomandation = false;
        component.showStar = true
      },
    });
  }


  ngOnDestroy(): void {
    this.info.alignWith("last");
    this.getUserDataService.emitDataChangeEvent();
    super.ngOnDestroy();
  }
}
