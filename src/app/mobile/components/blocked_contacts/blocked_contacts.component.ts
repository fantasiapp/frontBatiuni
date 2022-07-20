import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, } from "@angular/core";
import { Select } from "@ngxs/store";
import { Company, Profile } from "src/models/new/data.interfaces";
import { DataQueries, DataState, QueryAll } from "src/models/new/data.state";
import { Destroy$ } from "src/app/shared/common/classes";
import { AppComponent } from "src/app/app.component";
import { InfoService } from "src/app/shared/components/info/info.component";
import { getUserDataService } from "src/app/shared/services/getUserData.service";
import { SlidemenuService, UISlideMenuComponent } from "src/app/shared/components/slidemenu/slidemenu.component";
import { ExtendedProfileComponent } from "src/app/shared/components/extended-profile/extended-profile.component";
import { Observable } from "rxjs";
import { BlockCompany } from "src/models/new/user/user.actions";
import { take } from "rxjs/operators";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { UIAnnonceResume } from "../../ui/annonce-resume/annonce-resume.ui";
import { MyStore } from "src/app/shared/common/classes";

@Component({
    selector: "blocked_contacts",
    templateUrl: "./blocked_contacts.component.html",
    styleUrls: ["./blocked_contacts.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class BlockedContactsComponent extends Destroy$ {

    blockedCompanies: Company[] = [];
    openCompanyProfile: boolean = false;
    profile: Profile = this.store.selectSnapshot(DataQueries.currentProfile);
    blockedCompany!: Company 

    @QueryAll("Company")
    companies$!: Observable<Company[]>;

    @Select(DataQueries.currentProfile)
    profile$!: Observable<Profile>;

    constructor(
        private store: MyStore, 
        private slides: SlidemenuService,
        private info: InfoService, 
        private appComponent: AppComponent, 
        private cd: ChangeDetectorRef,
        private getUserDataService: getUserDataService,
      ) {
        super();
    }

    ngOnInit() {
      this.openCompanyProfile = false;
      this.info.alignWith('header_search');
      const user = this.store.selectSnapshot(DataQueries.currentUser);
      let userCompany = this.store.selectSnapshot(DataQueries.getById('Company', user.company))
      let allBlockedCompanies = this.store.selectSnapshot(DataQueries.getAll('BlockedCandidate'))
      let blockedCompaniesData = allBlockedCompanies.filter((company) => company.blocker == userCompany!.id && company.status == true)
      let blockedCompaniesId = blockedCompaniesData.map(company => company.blocked)
      this.blockedCompanies = this.store.selectSnapshot(DataQueries.getMany('Company', blockedCompaniesId))
      this.cd.markForCheck;
    }

    ngAfterViewInit() {
    }

    openProfile(company: Company) {
       this.openCompanyProfile = true;
       this.blockedCompany = company;
    }

    ngOnDestroy(): void {
        this.info.alignWith("last");
        this.getUserDataService.emitDataChangeEvent();
        super.ngOnDestroy();
    }

    updatePage() {
      this.cd.markForCheck()
    }
  
    @ViewChild("slideOnlinePost") private slideOnlinePost!: UISlideMenuComponent;
  
    @ViewChild(UIAnnonceResume, { static: false }) private annonceResume!: UIAnnonceResume;
  
    slideOnlinePostClose() {
      this.updatePage()
      // Close View
      this.slideOnlinePost.close();
    }

    deblockContact(){
      this.store
        .dispatch(new BlockCompany(this.blockedCompany.id, false))
        .pipe(take(1))
        .subscribe(() => {
          this.blockedCompanies = this.blockedCompanies.filter(company => company.id != this.blockedCompany.id)
          this.slideOnlinePost.close();          
          this.cd.markForCheck();
        });
    }


}