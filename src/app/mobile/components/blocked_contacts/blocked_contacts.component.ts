import { ChangeDetectionStrategy, ChangeDetectorRef, Component, } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Company, Profile } from "src/models/new/data.interfaces";
import { DataQueries, DataState, QueryAll } from "src/models/new/data.state";
import { Destroy$ } from "src/app/shared/common/classes";
import { AppComponent } from "src/app/app.component";
import { InfoService } from "src/app/shared/components/info/info.component";
import { getUserDataService } from "src/app/shared/services/getUserData.service";
import { SlidemenuService } from "src/app/shared/components/slidemenu/slidemenu.component";
import { ExtendedProfileComponent } from "src/app/shared/components/extended-profile/extended-profile.component";
import { Observable } from "rxjs";

@Component({
    selector: "blocked_contacts",
    templateUrl: "./blocked_contacts.component.html",
    styleUrls: ["./blocked_contacts.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class BlockedContactsComponent extends Destroy$ {

    blockedCompanies: Company[] = [];

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
    }

    ngOnInit() {
      this.info.alignWith('header_search');
      const user = this.store.selectSnapshot(DataQueries.currentUser);
      let userCompany = this.store.selectSnapshot(DataQueries.getById('Company', user.company))
      // A changer avec les contacts bloqués :
      let allBlockedCompanies = this.store.selectSnapshot(DataQueries.getAll('BlockedCandidate'))
      let blockedCompaniesData = allBlockedCompanies.filter((company) => company.blocker == userCompany!.id && company.status == true)
      let blockedCompaniesId = blockedCompaniesData.map(company => company.blocked)
      this.blockedCompanies = this.store.selectSnapshot(DataQueries.getMany('Company', blockedCompaniesId))
      this.cd.markForCheck;
    }

    ngAfterViewInit() {
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
            component.showStar = true;
            component.showDeblockButton = true;
          },
        });
    }

    ngOnDestroy(): void {
        this.info.alignWith("last");
        this.getUserDataService.emitDataChangeEvent();
        super.ngOnDestroy();
    }


}