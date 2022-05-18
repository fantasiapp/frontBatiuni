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
import { DistanceSliderConfig, SalarySliderConfig } from "src/app/shared/common/config";
import { splitByOutput } from "src/app/shared/common/functions";
import { Availability } from "src/app/shared/components/calendar/calendar.ui";
import { ExtendedProfileComponent } from "src/app/shared/components/extended-profile/extended-profile.component";
import { InfoService } from "src/app/shared/components/info/info.component";
import { MarkerType } from "src/app/shared/components/map/map.component";
import { SlidemenuService } from "src/app/shared/components/slidemenu/slidemenu.component";
import { FilterService } from "src/app/shared/services/filter.service";
import { getLevenshteinDistance } from "src/app/shared/services/levenshtein";
import { Company, Profile } from "src/models/new/data.interfaces";
import {
  availabilityToName,
  nameToAvailability,
} from "src/models/new/data.mapper";
import { DataQueries, Query, QueryAll } from "src/models/new/data.state";

@Component({
  selector: "sos-page",
  templateUrl: "./sos-page.component.html",
  styleUrls: ["./sos-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SOSPageComponent extends Destroy$ {
  imports = { DistanceSliderConfig, SalarySliderConfig };

  activeView: number = 0;
  openSOSFilterMenu: boolean = false;
  userAvailableCompanies: Company[] = [];
  allAvailableCompanies: Company[] = [];
  availabilities: MarkerType[] = [];

  @QueryAll("Company")
  companies$!: Observable<Company[]>;

  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  constructor(
    private store: Store, 
    private slides: SlidemenuService, 
    private info: InfoService, 
    private appComponent: AppComponent, 
    private cd: ChangeDetectorRef
  ) {
    super();
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
            this.availabilities.push(nameToAvailability(day.nature as any));
            continue;
          }
        } 
      }
    })      
    this.cd.markForCheck;
    this.selectPost(null);
  }

  ngAfterViewInit() {
    this.appComponent.updateUserData()
  }

  callbackFilter = (filter: any): void => {
    this.selectPost(filter);
  };

  selectPost(filter: any) {
    console.log("filterBefore", filter)
    this.userAvailableCompanies = [];
    if (filter == null) { 
      this.userAvailableCompanies = this.allAvailableCompanies;
    } else {
      // Trie les posts selon leur distance de levenshtein
      let levenshteinDist: any = [];
      if (filter.address) {
        for (let company of this.allAvailableCompanies) {
          levenshteinDist.push([company,getLevenshteinDistance(company.address.toLowerCase(), filter.address.toLowerCase())]);
        }
        levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
        let keys = levenshteinDist.map((key: any) => {
          return key[0];
        });
        this.allAvailableCompanies.sort((a: any,b: any)=>keys.indexOf(a) - keys.indexOf(b));
      } 

      // Trie les company selon leurs notes
      if (filter.sortNotation === true) {this.allAvailableCompanies.sort((a: any, b: any) => b['starsST'] - a['starsST'])} 

      for (let company of this.allAvailableCompanies) {
        console.log("filter",filter)
        let isNotIncludedJob = (filter.jobs && filter.jobs.length && filter.jobs.every((job: any) => {return job.id != company.jobs}))
        let isNotRightAmount = (filter.amount && (company.amount < filter.amount[0] || company.amount > filter.amount[1]))
        
        const user = this.store.selectSnapshot(DataQueries.currentUser);
        let userCompany: any = this.store.selectSnapshot(DataQueries.getById("Company", user.company));
        let userLatitude = userCompany.latitude*(Math.PI/180);
        let userLongitude = userCompany.longitude*(Math.PI/180);
        let postLatitude = company.latitude*(Math.PI/180);
        let postLongitude = company.longitude*(Math.PI/180);
        let distance = 6371*Math.acos(Math.sin(userLatitude)*Math.sin(postLatitude) + Math.cos(userLatitude)*Math.cos(postLatitude)*Math.cos(postLongitude-userLongitude))
        let isNotRightRadius = (filter.radius && (distance < filter.radius[0] || distance > filter.radius[1]))

        if (isNotRightAmount || isNotRightRadius || isNotIncludedJob) {continue}
        this.userAvailableCompanies.push(company);
      }
    }
    console.log("user", this.userAvailableCompanies)
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
      },
    });
  }


  ngOnDestroy(): void {
    this.info.alignWith("last");
    super.ngOnDestroy();
  }
}
