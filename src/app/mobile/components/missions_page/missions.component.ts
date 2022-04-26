import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { combineLatest, Observable } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { assignCopy } from "src/app/shared/common/functions";
import { MissionDetailedDay } from "src/app/shared/components/horizontalcalendar/horizontal.component";
import { InfoService } from "src/app/shared/components/info/info.component";
import { Mission, PostMenu, Profile } from "src/models/new/data.interfaces";
import { DataQueries, QueryAll } from "src/models/new/data.state";
import { CloseMissionST } from "src/models/new/user/user.actions";

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
  _openCloseMission = false
  doClose:boolean = false
  missionCompany:String = ""


  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  @QueryAll('Mission')
  missions$!: Observable<Mission[]>;

  constructor(private store: Store, private info: InfoService, private cd: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this.info.alignWith('header_search');

    combineLatest([this.profile$, this.missions$]).pipe(takeUntil(this.destroy$)).subscribe(([profile, missions]) => {
      //filter own missions
      //for now accept all missions
      this.myMissions = missions.filter(mission => mission.subContractor == profile.company.id);
      //compute work days

      this.detailedDays = [];
      let usedDay: number[] = []
      for ( const mission of this.myMissions ) {
        const availabilities = this.store.selectSnapshot(DataQueries.getMany('Disponibility', profile.company.availabilities))
        console.log("availabilities", availabilities, typeof(availabilities[0].date))
        const start = moment(mission.startDate),
          end = moment(mission.endDate),
          contractor = this.store.selectSnapshot(DataQueries.getById('Company', mission.company))!;
        
        const diffDays = end.diff(start, 'days', true);

        let day = start.clone();
        for ( let i = 0; i < diffDays; i++ ) {
          // console.log("day", day.locale('fr').format('YYYY-MM-DD'), typeof(day.locale('fr').format('YYYY-MM-DD')))
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
    if (this.missionToClose) {
      this._openCloseMission = this.missionToClose.securityST == 0
      const company = this.store.selectSnapshot(DataQueries.getById('Company', this.missionToClose.company))
      this.missionCompany = company!.name
      this._openCloseMission = true
    } else {
      this._openCloseMission = false
    }

  }

  openMission(mission: Mission) {
    this.missionMenu = assignCopy(this.missionMenu, {post: mission, open: !!mission, swipeup: false});
  }

  ngOnDestroy(): void {
    this.info.alignWith('last');
    super.ngOnDestroy();
  }

  get missionToClose (): Mission | null {
    const missionToClose = this.myMissions.filter(mission=>mission.isClosed && mission.vibeST == 0)
    if (missionToClose.length != 0) {
      return missionToClose[0]
    }
    return null
  }

  get classSubmit() {
    if (this.hasGeneralStarsST) {return "submitActivated"}
    else {return "submitDisable"}
  }

  get openCloseMission() {
    return this._openCloseMission }
  set openCloseMission(b:boolean) {
    this._openCloseMission = b
  }

  get hasGeneralStarsST() { return this.getArrayStarST("generalST")[0] == true}

  submitStarST() {
    if (this.hasGeneralStarsST)
      this.store.dispatch(new CloseMissionST(this.missionToClose!.id, this.missionToClose!.vibeST, this.missionToClose!.vibeCommentST, this.missionToClose!.securityST, this.missionToClose!.securityCommentST, this.missionToClose!.organisationST, this.missionToClose!.organisationCommentST)).pipe(take(1)).subscribe(() => {
        this.doClose = true
        this.openCloseMission = false
        this.cd.markForCheck()
      });
  }

  starActionST(index:number, nature:string) {
    if (nature == "vibeST")
      this.missionToClose!.vibeST = index + 1
    if (nature == "securityST")
      this.missionToClose!.securityST = index + 1
    if (nature == "organisationST")
      this.missionToClose!.organisationST = index + 1
    this.cd.markForCheck()
  }

  textStarActionST(nature:string) {
    if (nature == "vibeST") {
      let content = document.getElementById("starTextVibeST") as HTMLTextAreaElement;
      this.missionToClose!.vibeCommentST = content!.value
    } else if (nature == "securityST") {
      let content = document.getElementById("starTextSecurityST") as HTMLTextAreaElement;
      this.missionToClose!.securityCommentST = content!.value
    } else if (nature == "organisationST") {
      let content = document.getElementById("starTextOrganisationST") as HTMLTextAreaElement;
      this.missionToClose!.organisationCommentST = content!.value
    }
  }

  getArrayStarST(nature:string) {
    let array = new Array<boolean>(5)
    if (this.missionToClose) {
      let lastStar = 0
      if (nature == "vibeST") {
        lastStar = this.missionToClose!.vibeST
      }
      else if (nature == "securityST") {
        lastStar = this.missionToClose!.securityST
      }
      else if (nature == "organisationST") {
        lastStar = this.missionToClose!.organisationST
      }
      else if (nature == "generalST") {
        if (this.missionToClose!.vibeST && this.missionToClose!.securityST && this.missionToClose!.organisationST) {
          lastStar = Math.round((this.missionToClose!.vibeST + this.missionToClose!.securityST + this.missionToClose!.organisationST) / 3)
        }
      }
      for (let index=0; index < 5; index++) {
        array[index] = (index < lastStar) ? true : false
      }
    }
      return array
  }
};