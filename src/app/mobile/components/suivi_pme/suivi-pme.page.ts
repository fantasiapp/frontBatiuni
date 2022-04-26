import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewChild } from "@angular/core";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { CloseMission, ModifyMissionDate, DuplicatePost } from "src/models/new/user/user.actions";
import { Company, Mission, PostMenu, PostDetail, Profile, Supervision, DateG, Task } from "src/models/new/data.interfaces";
import { DataQueries, DataState } from "src/models/new/data.state";
import { CalendarUI, DayState } from "src/app/shared/components/calendar/calendar.ui";
import { type } from "os";

// export type Task = PostDetail & {validationImage:string, invalidationImage:string}

// , validationImage:"assets/suivi-valider.svg", invalidationImage:"assets/suivi-refuser.svg"

export interface accordionData {
  date: DateG,
  open: boolean 
}

@Component({
  selector: 'suivi-chantier',
  templateUrl:"suivi-pme.page.html",
  styleUrls:['suivi-pme.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuiviPME {

  company: Company | null = null;
  subContractor: Company | null = null;
  track: {[key: string]: Map<PostDetail, Supervision[]>} = {};
  isNotSigned : boolean = true
  isNotSignedByUser : boolean = true
  dates : DateG[] = []
  currentDateId : number | null = null
  tasks: Task[] | null = null
  companyName : string = ""
  contactName : string = ""
  view: 'ST' | 'PME' = "PME";
  mission: Mission | null = null
  swipeupModifyDate:boolean = false
  alert: string = "."

  _missionMenu: PostMenu<Mission> = new PostMenu<Mission>()
  get missionMenu() { return this._missionMenu }

  AdFormDate = new FormGroup({
    hourlyStart: new FormControl('07:00'),
    hourlyEnd: new FormControl('17:30:00'),
    calendar: new FormControl([]),
  })

  accordionsData: accordionData[] = [];


  openAccordion(accordion: accordionData){
    for (const accordionData of this.accordionsData) {
      if(accordionData.date == accordion.date){
        accordionData.open = accordion.open
      }
    }
  }

  @Input()
  set missionMenu(mM: PostMenu<Mission>) {
    this._missionMenu = mM
    const mission = mM.post
    this.view = this.store.selectSnapshot(DataState.view)
    this.mission = mission;
    this.company = mission ? this.store.selectSnapshot(DataQueries.getById('Company', mission.company)) : null;
    this.subContractor = mission ? this.store.selectSnapshot(DataQueries.getById('Company', mission.subContractor)) : null;
    if ( mission ) {
      this.isNotSigned = !(mission.signedByCompany && mission.signedBySubContractor)
      this.isNotSignedByUser = (!mission.signedByCompany && this.view == 'PME') || (!mission.signedBySubContractor && this.view == 'ST')
      this.computeDates (mission)
      this.companyName  = this.view == 'ST' ? this.subContractor!.name : this.company!.name
      this.contactName = this.view == 'ST' ? this.mission!.subContractorContact : ""
      
    }
    if (mission) {
      this.AdFormDate.get('hourlyStart')?.setValue(mission!.hourlyStart);
      this.AdFormDate.get('hourlyEnd')?.setValue(mission!.hourlyEnd);
      
      let daystates: DayState[] = [];
      if (mission!.dates.length) {
        if ( typeof mission!.dates[0] == 'string' )
          daystates =  mission!.dates.map(date => ({date: date as unknown as string, availability: 'selected'}))
        else
          daystates = this.store.selectSnapshot(DataQueries.getMany('DatePost', mission!.dates))
            .map(({name}) => ({date: name, availability: 'selected'}))

        this.AdFormDate.get('calendar')?.setValue(daystates);
        this.calendar?.viewCurrentDate();
      }
    }
  }

  @Input() callBackParent: (b:boolean, type:string) => void = (b:boolean, type:string): void => {}
  @Input() toogle: boolean = false

  @ViewChild(CalendarUI, {static: false}) calendar!: CalendarUI;

  computeDates (mission:Mission) {
    let supervisionsTaks: number[] = []
    this.tasks = this.store.selectSnapshot(DataQueries.getMany('DetailedPost', mission.details)).map(detail => (
      { id:detail.id,
        date:detail.date,
        content:detail.content,
        validated:detail.validated,
        refused:detail.refused,
        supervisions:detail.supervisions,
        supervisionsObject:this.computeSupervisionsforTask(detail.supervisions, supervisionsTaks),
        validationImage:SuiviPME.computeTaskImage(detail, "validated"),
        invalidationImage:SuiviPME.computeTaskImage(detail, "refused"
      )})
    )
    this.dates = mission.dates.map((value:unknown, id) => {
      return { id:id,
        value: value as string,
        tasks:this.tasks,
        selectedTasks:this.computeSelectedTask(value as string),
        taskWithoutDouble:this.dateWithoutDouble(),
        view:this.view,
        supervisions: this.computeSupervisionsForMission(value as string, supervisionsTaks)
      } as DateG
    })
    if(this.accordionsData.length != 0) return
    for (const date of this.dates) {
      this.accordionsData.push({date: date, open: false})
    }
  }

  computeSupervisionsforTask(supervisionsId: number[], supervisionsTask:number[]) {
    let supervisions: Supervision[] = []
    supervisionsId.forEach(id => {
      let supervision = this.store.selectSnapshot(DataQueries.getById('Supervision', id))
      if (supervision) {
        supervisions.push(supervision!)
        supervisionsTask.push(supervision.id)
      }
    })
    return supervisions
  }

  computeSupervisionsForMission(date:string, supervisionsTask:number[]):Supervision[] {
    let supervisions: Supervision[] = []
    let allSupervisions: (Supervision|null)[] = this.mission!.supervisions.map(id => {
      let supervision = this.store.selectSnapshot(DataQueries.getById('Supervision', id))
      if (supervision && supervision.date == date && !supervisionsTask.includes(supervision.id )) {
        return supervision
      }
      return null
    })
    for (let index in allSupervisions) {
      if (allSupervisions[index]) {
        supervisions.push(allSupervisions[index]!)
      }
    }
    return supervisions
  }

  static computeTaskImage(task:PostDetail, type:String) {
    if (type === "validated") {
      if (task.validated && !task.refused) {
        return "assets/suivi-valider-OK.svg"
      } else {
        return "assets/suivi-valider.svg"
      }
    } else {
      if (!task.validated && task.refused) {
        return "assets/suivi-refuser-OK.svg"
      } else {
        return "assets/suivi-refuser.svg"
      }
    }
  }

  dateWithoutDouble(): Task[] {
    let listWithOutDouble: Task[] = []
    let listWithOutDoubleStr: string[] = []
    let dictionary = Object.assign({}, ...this.tasks!.map((task) => ({[task.content]: task})))
    Object.keys(dictionary).forEach( key => {
      if (!listWithOutDoubleStr.includes(dictionary[key])) {
        listWithOutDouble.push(dictionary[key])
        listWithOutDoubleStr.push(key)
      }
    })
    return listWithOutDouble
  }

  computeSelectedTask(date:string) {
    let selectedTask: Task[] = []
    this.tasks!.forEach(task => this.computeSelectedTaskAction(selectedTask, date, task))
    return selectedTask
  }

  computeSelectedTaskAction(selectedTask:Task[], date:string, task:Task) {
    if (date == task.date) {
      selectedTask.push(task)
    }
  }

  constructor(private store: Store, private popup: PopupService, private cd: ChangeDetectorRef) {}


  closeMission() {
    if (this.mission!.subContractor && !this.mission!.isClosed) {
      const company = this.store.selectSnapshot(DataQueries.getById('Company', this.mission!.subContractor))
      this.popup.openCloseMission(company!, this)
    }
    this.callBackParent(false, "menu")
    this.cd.markForCheck()
  }

  openCloseMission () {
    this.callBackParent(true, "closeMission")
    this.getArrayStar("quality")
    this.cd.markForCheck()
  }

  starAction(index:number, nature:string) {
    if (nature == "quality")
      this.mission!.quality = index + 1
    if (nature == "security")
      this.mission!.security = index + 1
    if (nature == "organisation")
      this.mission!.organisation = index + 1
    this.cd.markForCheck()
  }

  get hasGeneralStars() { return this.getArrayStar("general")[0] == true }

  get classSubmit() {
    if (this.hasGeneralStars) {return "submitActivated"}
    else {return "submitDisable"}
  }

  textStarAction(nature:string) {
    if (nature == "quality") {
      let content = document.getElementById("starTextQuality") as HTMLTextAreaElement;
      this.mission!.qualityComment = content!.value
    } else if (nature == "security") {
      let content = document.getElementById("starTextSecurity") as HTMLTextAreaElement;
      this.mission!.securityComment = content!.value
    } else if (nature == "organisation") {
      let content = document.getElementById("starTextOrganisation") as HTMLTextAreaElement;
      this.mission!.organisationComment = content!.value
    }
  }

  getArrayStar (nature:string){
    let array = new Array<boolean>(5)
    if (this.mission) {
      let lastStar = 0
      if (nature == "quality") {
        lastStar = this.mission!.quality
      }
      else if (nature == "security") {
        lastStar = this.mission!.security
      }
      else if (nature == "organisation") {
        lastStar = this.mission!.organisation
      }
      else if (nature == "general") {
        if (this.mission!.quality && this.mission!.security && this.mission!.organisation) {
          lastStar = Math.round((this.mission!.quality + this.mission!.security + this.mission!.organisation) / 3)
        }
      }
      for (let index=0; index < 5; index++) {
        array[index] = (index < lastStar) ? true : false
      }
    }
      return array
  }

  submitStar() {
    if (this.hasGeneralStars)
      this.store.dispatch(new CloseMission(this.mission!.id, this.mission!.quality, this.mission!.qualityComment, this.mission!.security, this.mission!.securityComment, this.mission!.organisation, this.mission!.organisationComment)).pipe(take(1)).subscribe(() => {
        this._missionMenu.swipeupCloseMission = false
        this.cd.markForCheck()
      });
  }

  @Select(DataQueries.currentProfile)
  currentProfile$!: Observable<Profile>;

  signContract() {
    this.popup.openSignContractDialog(this.mission!);
  }

  reloadMission = (dateOld:DateG): (DateG|Mission)[] =>  {
    let dateResult = dateOld
    this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
    this.computeDates(this.mission!)
    this.dates.forEach(dateNew => {
      if (dateNew.value == dateOld.value) {
        dateResult = dateNew
      }
    })
    // this.cd.markForCheck()
    console.log("realoadMission", this.dates)

    
    return [dateResult, this.mission!]
  }

  modifyTimeTable() {
    this.missionMenu.swipeup = false
    this.swipeupModifyDate = true
    console.log("modifyTimeTable", this.mission)
    this.cd.markForCheck()
  }

  duplicateMission() {
    this.missionMenu.swipeup = false
    console.log("duplicateMission", this.mission)
    // this.info.show("info", "Duplication en cours...", Infinity);
    this.store.dispatch(new DuplicatePost(this.mission!.id)).pipe(take(1)).subscribe(() => {
    }, () => {
      // this.info.show("error", "Erreur lors de la duplication de l'annonce");
    });
  }



  submitAdFormDate() {
    let datesSelected = this.AdFormDate.get('calendar')!.value.map((dayState:DayState) => {
      return dayState.date
    })
    let blockedDates = this.computeBlockedDate()
    this.alert = ""
    let dateToBeSelected:string[] = []
    blockedDates.forEach((date) => {
      if (!datesSelected.includes(date)) {
        this.alert += `La date ${date} doit obligatoirement être sélectionnée.\r\n`
        dateToBeSelected.push(date)
      }
    })
    this.setupDayState(this.mission!, dateToBeSelected)
    this.saveToBackAdFormDate()
  }

  setupDayState (mission:Mission, dateToBeSelected:string[]) {
    let dayStates: DayState[] = dateToBeSelected.map((date) => {
      return {date:date, availability: 'selected'}
    })
    this.AdFormDate.get('calendar')?.value.forEach((day:DayState) => {
      dayStates.push(day)
    })
    this.AdFormDate.get('calendar')?.setValue(dayStates);
    }

    saveToBackAdFormDate() {
      const selectedDate:string[] = this.AdFormDate.get('calendar')!.value.map((dayState:DayState) => {return dayState.date})
      this.store.dispatch(new ModifyMissionDate(this.mission!.id, this.AdFormDate.get('hourlyStart')!.value, this.AdFormDate.get('hourlyEnd')!.value, selectedDate)).pipe(take(1)).subscribe(() => {
        if (!this.alert)
          this.swipeupModifyDate = false
        this.cd.markForCheck()
      });
    }

  computeBlockedDate() : string[] {
    let listBlockedDate:string[] = []
    let listDetailedPost = this.mission!.details
    listDetailedPost.forEach( (detailId) => {
      let detailDate = this.store.selectSnapshot(DataQueries.getById('DetailedPost', detailId))!.date
      if (!listBlockedDate.includes(detailDate)) {
        listBlockedDate.push(detailDate)
      }
    })
    return listBlockedDate
  }
}