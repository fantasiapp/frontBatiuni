import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { UIDefaultAccessor } from "src/app/shared/common/classes";
import {Profile, Post, Mission, PostMenu, Candidate, User } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";
import { FormControl, FormGroup } from "@angular/forms";
import { Store } from "@ngxs/store";

@Component({
  selector: 'searchbar',
  templateUrl: 'searchbar.component.html',
  styleUrls: ['searchbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarComponent  implements OnInit{

  @Input()
  placeholder: string = "Rechercher une annonce";

  @Input()
  activeView: number = 0;

  @Input()
  callbackSearch: Function = () => {};

  searchForm = new FormGroup({
    search: new FormControl(""),
  },
    {}
  );

  constructor(private store: Store){}

  ngOnInit(){
    this.callbackSearch(this.searchForm.value.search);
    this.searchForm.valueChanges.subscribe(value => {
      this.callbackSearch(value.search);
    });
  }

  resetSearch(){
    this.searchForm.reset();
  }

  adToString(ad: any, adString: string){
    adString += ad.id.toString() + " " + ad.address;
    if (ad === 'Post' || ad === 'Mission'){
      let company = this.store.selectSnapshot(DataQueries.getById("Company", ad.company));
      let job = this.store.selectSnapshot(DataQueries.getById("Job", ad.job));
      // let details = this.store.selectSnapshot(DataQueries.getMany("DetailedPost", ad.detail));
      // let detailContent = details.map((detail: { content: any; }) => detail.content).toString();
      let manPower = ad.manPower ? "Main d'oeuvre" : "Fourniture et Pose"
      adString += company?.name + " " + job?.name + " " + ad.contactName + " " + ad.description + " " + manPower + " " + ad.dueDate + " " + ad.startDate + " " + ad.endDate 
      if (ad === 'Mission'){
        let supervisions = this.store.selectSnapshot(DataQueries.getMany("Supervision", ad.supervisions));
        let supervisionsContent = supervisions.map((supervision: { comment: any; }) => supervision.comment).toString();
        adString += ad.organisationComment + " " + ad.organisationCommentST + " " + ad.qualityComment + " " + ad.securityComment + " " + ad.securityCommentST + " " + ad.subContractorContact + " " + ad.subContractorName + " " + supervisionsContent
      }
    }
    if (ad === 'Company'){
      let companiesJobs = this.store.selectSnapshot(DataQueries.getMany("JobForCompany", ad.jobs));
      let companyJob = companiesJobs.map(job => job.job);
      let jobs = this.store.selectSnapshot(DataQueries.getMany("Job", companyJob));
      let jobsNames = jobs.map(job => job.name).toString();

      adString += ad.activity + " " + ad.name + " " + jobsNames + " " + ad.ntva + " " + ad.siret + " " + ad.webSite
    }
  }

};