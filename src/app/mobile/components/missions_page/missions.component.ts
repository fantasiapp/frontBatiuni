import { ChangeDetectionStrategy, Component, ViewChild } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { combineLatest, Observable } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { assignCopy } from "src/app/shared/common/functions";
import { MissionDetailedDay } from "src/app/shared/components/horizontalcalendar/horizontal.component";
import { InfoService } from "src/app/shared/components/info/info.component";
import { Mission, PostMenu, Profile } from "src/models/new/data.interfaces";
import { DataQueries, QueryAll } from "src/models/new/data.state";

import * as moment from 'moment';



@Component({
  selector: 'missions',
  templateUrl: 'missions.component.html',
  styleUrls: ['missions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MissionsComponent extends Destroy$ {
  activeView: number = 0;

  openFilterMenu: boolean = false;
  myMissions: Mission[] = []
  missionMenu = new PostMenu<Mission>()

  detailedDays: MissionDetailedDay[] = [];


  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  @QueryAll('Mission')
  missions$!: Observable<Mission[]>;

  constructor(private store: Store, private info: InfoService) {
    super();
  }

  ngOnInit() {
    this.info.alignWith('header_search');

    combineLatest([this.profile$, this.missions$]).pipe(takeUntil(this.destroy$)).subscribe(([profile, missions]) => {
      //filter own missions
      //for now accept all misisons
      this.myMissions = missions.filter(mission => mission.subContractor == profile.company.id);
      //compute work days

      this.detailedDays.length = 0;
      for ( const mission of this.myMissions ) {
        const start = moment(mission.startDate),
          end = moment(mission.endDate),
          contractor = this.store.selectSnapshot(DataQueries.getById('Company', mission.company))!;
        
        const diffDays = end.diff(start, 'days', true);

        let day = start.clone();
        for ( let i = 0; i < diffDays; i++ ) {
          this.detailedDays.push({
            date: day.locale('fr').format('YYYY-MM-DD'),
            start: mission.hourlyStart,
            end: mission.hourlyEnd,
            text: 'Chantier de ' + contractor.name 
          });

          day = day.add(1, 'day');
        }
      }
    });
  }

  openMission(mission: Mission) {
    this.missionMenu = assignCopy(this.missionMenu, {post: mission, open: !!mission, swipeup: false});
  }

  ngOnDestroy(): void {
    this.info.alignWith('last');
    super.ngOnDestroy();
  }
};