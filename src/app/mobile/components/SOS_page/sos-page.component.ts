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

  @QueryAll("Company")
  companies$!: Observable<Company[]>;

  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  getAvailableCompanies(companies: Company[]) {
    return companies;
  }

  availableCompanies$: Observable<{
    companies: Company[];
    availabilities: MarkerType[];
  }>;

  userAvailableCompanies: Company[] = [];
  allAvailableCompanies: Company[] = [];

  constructor(private store: Store, private slides: SlidemenuService, private info: InfoService, private appComponent: AppComponent, private cd: ChangeDetectorRef) {
    super();
    const now = new Date().toISOString().slice(0, 10);
    this.availableCompanies$ = this.companies$.pipe(
      switchMap((companies) => {
        let availableCompanies: Company[] = [],
          availabilities: MarkerType[] = [];
        companyLoop: for (const company of companies) {
          const ownAvailabilities = this.store.selectSnapshot(
            DataQueries.getMany("Disponibility", company.availabilities)
          );
          for (const day of ownAvailabilities)
            if (day.date == now) {
              availableCompanies.push(company);
              availabilities.push(nameToAvailability(day.nature as any));
              continue companyLoop;
            }
        }
        this.allAvailableCompanies = availableCompanies;
        return of({ companies: availableCompanies, availabilities });
        
      })
    );
    this.appComponent.updateUserData()
  }

  ngOnInit() {
    // this.info.alignWith("header_search");
    // const now = new Date().toISOString().slice(0, 10);
    // companyLoop: for (const company of this.companies$) {
    //   const ownAvailabilities = this.store.selectSnapshot(DataQueries.getMany("Disponibility", company.availabilities));
    //   for (const day of ownAvailabilities){
    //     if (day.date == now) {
    //       this.allAvailableCompanies.push(company);
    //       continue companyLoop;
    //     }
    //   }
    // }  
    // this.cd.markForCheck();
    this.selectPost(null);
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

  selectPost(filter: any) {
    this.userAvailableCompanies = [];
    console.log("all", this.allAvailableCompanies)
    if (filter == null) { this.userAvailableCompanies == this.allAvailableCompanies;
    } else {
      // Array qui contiendra les posts et leur valeur en distance Levenshtein pour une adresse demandée
      let levenshteinDist: any = [];
      if (filter.address) {
        for (let company of this.allAvailableCompanies) {
          levenshteinDist.push([company,getLevenshteinDistance(company.address.toLowerCase(), filter.address.toLowerCase())]);
        }
        levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
        let keys = levenshteinDist.map((key: any) => {
          return key[0];
        });

        // Trie les posts selon leur distance de levenshtein
        this.allAvailableCompanies.sort((a: any,b: any)=>keys.indexOf(a) - keys.indexOf(b));
      } else {
        this.allAvailableCompanies.sort((a, b) => {
          return a["id"] - b["id"];
        });
      }

      // Trie les company selon leurs notes
      if (filter.sortNotation === true) {this.allAvailableCompanies.sort((a: any, b: any) => b['starsST'] - a['starsST'])} 

      for (let company of this.allAvailableCompanies) {

        console.log(filter)
        let isNotIncludedJob = (filter.jobs && filter.jobs.length && filter.jobs.every((job: any) => {return job.id != company.jobs}))

        if (isNotIncludedJob) {
          continue;
        }
        this.userAvailableCompanies.push(company);
      }
    }
    console.log(this.userAvailableCompanies)
    this.cd.markForCheck();
  }
}
