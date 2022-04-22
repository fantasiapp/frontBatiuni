import { Component, Input, Output } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UIOpenMenu } from 'src/app/shared/common/classes';
import { InfoService } from 'src/app/shared/components/info/info.component';
import { Company, Mission, Profile } from 'src/models/new/data.interfaces';
import { DataQueries, DataState } from 'src/models/new/data.state';

interface ratingInfo {
  contactName: string;
  subContractorName: string;
  companyContractor: string;
  subContractorContact: string;
  qualityVibe: number;
  qualityVibeComment: string;
  security: number;
  securityComment: string;
  organisation: number;
  organisationComment: string;
}

@Component({
  selector: 'rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent extends UIOpenMenu {
  
  
  openRatings: boolean = false;
  
  // @Select(DataQueries.currentProfile)
  // profile$!: Observable<Profile>;
  // profile!: Profile;

  @Input()
  profile!: Profile;

  @Input()
  profileRecommandation: boolean = false

  @Input()
  view: 'ST' | 'PME' | null = 'PME'

  missions: Mission[] | undefined;
  ratingInfos?: ratingInfo[];
  company: Company | undefined;
  
  constructor(private info: InfoService, private store: Store) {
    super()
  }

  // view: 'ST' | 'PME' = 'ST';
  // ngOnInit() {
    // this.view = this.store.selectSnapshot(DataState.view)
  // }

  ngOnChanges(){
    
    // permet de limiter l'appel de 
    // if (this.company != this.profile.company ) {
      this.company = this.profile.company
      this.setRatingInfos(this.company)
    // }
  }

  setRatingInfos(company: Company){
    this.ratingInfos = []
    if( this.view == 'ST'){
      let missions = this.store.selectSnapshot(DataQueries.getAll('Mission'))
      for ( let i = 0; i < missions.length; i++ ) {
        const mission = missions[i];
        if (mission.subContractor == company.id && mission.isClosed && mission.quality ) {
          let companyContractor = this.store.selectSnapshot(DataQueries.getById('Company', mission.company))
          let ratingInfo: ratingInfo = {
            contactName: mission.contactName,
            subContractorName: '',
            companyContractor: companyContractor!.name,
            subContractorContact: '',
            qualityVibe: mission.quality,
            qualityVibeComment: mission.qualityComment,
            security: mission.security,
            securityComment: mission.securityComment,
            organisation: mission.organisation,
            organisationComment: mission.organisationComment,
          }
          this.ratingInfos.push(ratingInfo);
        }
      }
    } else {
      let missions = this.store.selectSnapshot(DataQueries.getMany('Mission', company.missions))
      for (const mission of missions) {
        if (mission.isClosed && mission.vibeST) {
          let ratingInfo: ratingInfo = {
            contactName: '',
            subContractorName: mission.subContractorContact,
            companyContractor: '',
            subContractorContact: mission.subContractorName,
            qualityVibe: mission.vibeST,
            qualityVibeComment: mission.vibeCommentST,
            security: mission.securityST,
            securityComment: mission.securityCommentST,
            organisation: mission.organisationST,
            organisationComment: mission.organisationCommentST,
          }
          this.ratingInfos.push(ratingInfo)
        }
      }
    }
  }
  
  set open(value: boolean) {   
    this.openRatings = value
    super.open = value   
  }
  
  close() {
    this.openRatings = false
    this.openChange.emit(this.openRatings)
  }
}
