import { Component, Input, Output } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UIOpenMenu } from 'src/app/shared/common/classes';
import { InfoService } from 'src/app/shared/components/info/info.component';
import { Company, Mission, Profile } from 'src/models/new/data.interfaces';
import { DataQueries, DataState } from 'src/models/new/data.state';

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

  missions: Mission[] | undefined;
  company: Company | undefined;
  
  constructor(private info: InfoService, private store: Store) {
    super()
  }

  view: 'ST' | 'PME' = 'ST';
  ngOnInit() {
    this.view = this.store.selectSnapshot(DataState.view)
    console.log('profile', this.profile);
  }

  ngOnChanges(){
    
    this.company = this.profile.company 
    let missionRated = []
    if( this.view == 'ST'){
      let missions = this.store.selectSnapshot(DataQueries.getAll('Mission'))
      for (const mission of missions) {
        (mission.subContractor == this.company.id && mission.isClosed) && missionRated.push(mission)
      }
    } else {
      let missions = this.store.selectSnapshot(DataQueries.getMany('Mission', this.company.missions))
      for (const mission of missions) {
        console.log('missions', mission);
        mission.isClosed && missionRated.push(mission)
      }
    }
    this.missions = missionRated
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
