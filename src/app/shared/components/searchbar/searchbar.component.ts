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
    document.querySelector("form")?.reset();
  }

  postToString(ad: any){
    let company = this.store.selectSnapshot(DataQueries.getById("Company", ad.company));
    let job = this.store.selectSnapshot(DataQueries.getById("Job", ad.job));
    let details = this.store.selectSnapshot(DataQueries.getMany("DetailedPost", ad.details));
      let detailContent = details.map((detail: { content: any; }) => detail.content);
    let manPower = ad.manPower ? "Main d'oeuvre" : "Fourniture et Pose"
    let adString = ad.id.toString() + " " + ad.address + " " + company?.name + " " + job?.name + " " + detailContent +  " " + ad.contactName + " " + ad.description + " " + manPower + " " + ad.dueDate + " " + ad.startDate + " " + ad.endDate 
    return adString
  }

  companyToString(ad: any){
    let companiesJobs = this.store.selectSnapshot(DataQueries.getMany("JobForCompany", ad.jobs));
    let companyJob = companiesJobs.map(job => job.job);
    let jobs = this.store.selectSnapshot(DataQueries.getMany("Job", companyJob));
    let jobsNames = jobs.map(job => job.name).toString();
    let adString = ad.id.toString() + " " + ad.address + " " + ad.activity + " " + ad.name + " " + jobsNames + " " + ad.ntva + " " + ad.siret + " " + ad.webSite
    return adString
  }

  missionToString(ad: any){
    let company = this.store.selectSnapshot(DataQueries.getById("Company", ad.company));
    let job = this.store.selectSnapshot(DataQueries.getById("Job", ad.job));
    let details = this.store.selectSnapshot(DataQueries.getMany("DetailedPost", ad.details));
    let detailContent = details.map((detail: { content: any; }) => detail.content);
    let manPower = ad.manPower ? "Main d'oeuvre" : "Fourniture et Pose"
    let supervisions = this.store.selectSnapshot(DataQueries.getMany("Supervision", ad.supervisions));
    let supervisionsContent = supervisions.map((supervision: { comment: any; }) => supervision.comment).toString();
    let adString = ad.id.toString() + " " + ad.address + " " + company?.name + " " + detailContent + " " + job?.name + " " + ad.contactName + " " + ad.description + " " + manPower + " " + ad.dueDate + " " + ad.startDate + " " + ad.endDate + " " + ad.organisationComment + " " + ad.organisationCommentST + " " + ad.qualityComment + " " + ad.securityComment + " " + ad.securityCommentST + " " + ad.subContractorContact + " " + ad.subContractorName + " " + supervisionsContent
    return adString
  }

};