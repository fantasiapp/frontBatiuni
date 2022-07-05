import { Component, Input, Output } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UIOpenMenu } from 'src/app/shared/common/classes';
import { InfoService } from 'src/app/shared/components/info/info.component';
import { Company, Mission, Profile } from 'src/models/new/data.interfaces';
import { DataQueries, DataState } from 'src/models/new/data.state';
import { BooleanService } from '../../services/boolean.service';

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

interface recommandationInfo {
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
  lastWorksiteDate: string;
}

@Component({
  selector: 'rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent extends UIOpenMenu {
  
  
  openRatings: boolean = false;
  hasRatings: boolean = false;
  profileEmail: string = ''
  
  // @Select(DataQueries.currentProfile)
  // profile$!: Observable<Profile>;
  // profile!: Profile;

  @Input()
  profile!: Profile;

  @Input()
  profileRecommandation: boolean = false

  @Input()
  view: 'ST' | 'PME' | null = null;

  missions: Mission[] | undefined;
  ratingInfos?: ratingInfo[];
  recommandationInfos?: recommandationInfo[];
  company: Company | undefined;
  openRecommandationMenu: boolean = false;

    constructor(private info: InfoService, private store: Store, private booleanService: BooleanService) {
    super()
  }

  // view: 'ST' | 'PME' = 'ST';
  // ngOnInit() {
    // this.view = this.store.selectSnapshot(DataState.view)
  // }

  ngOnChanges(){
    if (!this.profile) {
      this.profile = this.store.selectSnapshot(DataQueries.currentProfile)
    }
    // permet de limiter l'appel de 
    // if (this.company != this.profile.company ) {
      this.profileEmail = this.profile.user?.email || ''
      this.company = this.profile.company
      this.setRatingInfos(this.company)
    // }
  }

  setRatingInfos(company: Company){
    this.ratingInfos = []
    this.recommandationInfos = []
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
      this.getRecommandations(company)
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
      this.getRecommandations(company)
    }
    if (this.ratingInfos.length != 0) {
      this.hasRatings = true
      this.booleanService.emithasRatingsChangeEvent(this.hasRatings)
    }
  }
  
  set open(value: boolean) {   
    this.openRatings = value
    super.open = value   
  }

  openRecommandation() {
    this.openRecommandationMenu = true
  }
  
  close() {
    this.openRatings = false
    this.openChange.emit(this.openRatings)
  }

  getRecommandations(company: Company) {
    let recommandations = this.store.selectSnapshot(DataQueries.getAll('Recommandation'))
    for (const recommandation of recommandations) {
      if(recommandation.companyRecommanded == company.id && recommandation.view == this.viewId) {
        let recommandationInfo: recommandationInfo = {
          contactName:recommandation.firstNameRecommanding + " " + recommandation.lastNameRecommanding,
          subContractorName: recommandation.firstNameRecommanding + " " + recommandation.lastNameRecommanding,
          companyContractor: recommandation.companyNameRecommanding,
          subContractorContact: recommandation.companyNameRecommanding,
          qualityVibe: recommandation.qualityStars,
          qualityVibeComment: recommandation.qualityComment,
          security: recommandation.securityStars,
          securityComment: recommandation.securityComment,
          organisation: recommandation.organisationStars,
          organisationComment: recommandation.organisationComment,
          lastWorksiteDate: recommandation.lastWorksiteDate
        }
        this.recommandationInfos!.push(recommandationInfo)
      }
    }
  }

  toFrenchDate(date: string) {
    let listDate = date.split("-")
    return listDate[2]+"/"+listDate[1]+"/"+listDate[0]
  }

  get viewId() {
    let currentView = this.store.selectSnapshot(DataState.view)
    if (currentView == "ST") 
      return 2
    else return 1  
  }
}
