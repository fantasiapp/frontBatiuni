import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { Store } from "@ngxs/store";
import { Observable, of } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { Availability } from "src/app/shared/components/calendar/calendar.ui";
import { ExtendedProfileComponent } from "src/app/shared/components/extended-profile/extended-profile.component";
import { MarkerType } from "src/app/shared/components/map/map.component";
import { SlidemenuService } from "src/app/shared/components/slidemenu/slidemenu.component";
import { Company } from "src/models/new/data.interfaces";
import { availabilityToName, nameToAvailability } from "src/models/new/data.mapper";
import { DataQueries, Query, QueryAll } from "src/models/new/data.state";

@Component({
  selector: 'sos-page',
  templateUrl: './sos-page.component.html',
  styleUrls: ['./sos-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SOSPageComponent {
  activeView: number = 0;
  openSOSFilterMenu: boolean = false;
  
  @QueryAll('Company')
  private companies$!: Observable<Company[]>;

  private getAvailableCompanies(companies: Company[]) {
    return companies;
  }

  availableCompanies$: Observable<{companies: Company[], availabilities: MarkerType[]}>;

  constructor(private store: Store, private slides: SlidemenuService) {
    const now = (new Date).toISOString().slice(0, 10);
    this.availableCompanies$ = this.companies$.pipe(
      switchMap(companies => {
        let availableCompanies: Company[] = [], availabilities: MarkerType[] = [];
        companyLoop: for ( const company of companies ) {
          const ownAvailabilities = this.store.selectSnapshot(DataQueries.getMany('Disponibility', company.availabilities));
          for ( const day of ownAvailabilities )
            if ( day.date == now ) {
              availableCompanies.push(company);
              availabilities.push(nameToAvailability(day.nature as any));
              continue companyLoop;
            }
        };

        console.log(availableCompanies, availabilities);
        return of({companies: availableCompanies, availabilities});
      })
    );
  }

  checkCompanyProfile(company: Company) {
    this.slides.show(company.name, {
      type: 'component',
      component: ExtendedProfileComponent,
      init: (component: ExtendedProfileComponent) => {
        component.profile$ = {company};
      }
    })
  }
};