import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { Company, Mission, PostDetail, Profile, Supervision, DateG, Task } from "src/models/new/data.interfaces";
import { DataQueries, DataState } from "src/models/new/data.state";

// export type Task = PostDetail & {validationImage:string, invalidationImage:string}

// , validationImage:"assets/suivi-valider.svg", invalidationImage:"assets/suivi-refuser.svg"
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

  _mission: Mission | null = null;
  get mission() { return this._mission; }
  
  @Input()
  set mission(mission: Mission | null) {
    this.view = this.store.selectSnapshot(DataState.view)
    this._mission = mission;
    this.company = mission ? this.store.selectSnapshot(DataQueries.getById('Company', mission.company)) : null;
    this.subContractor = mission ? this.store.selectSnapshot(DataQueries.getById('Company', mission.subContractor)) : null;
    if ( mission ) {
      this.isNotSigned = !(mission.signedByCompany && mission.signedBySubContractor)
      this.isNotSignedByUser = (!mission.signedByCompany && this.view == 'PME') || (!mission.signedBySubContractor && this.view == 'ST')
      this.computeDates (mission)
      this.companyName  = this.view == 'ST' ? this.subContractor!.name : this.company!.name
      this.contactName = this.view == 'ST' ? this.mission!.subContractorName : ""
      
    }
  }

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
        invalidationImage:SuiviPME.computeTaskImage(detail, "refused")}))
    console.log("computeDates, tasks", this.tasks)
    console.log("computeDates, id", supervisionsTaks)
    this.dates = mission.dates.map((value, id) => (
      { id:id,
        value: value,
        tasks:this.tasks,
        selectedTasks:this.computeSelectedTask(value),
        taskWithoutDouble:this.dateWithoutDouble(),
        view:this.view,
        supervisions: this.computeSupervisionsForMission(value, supervisionsTaks)}))
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

  computeSupervisionsForMission(date:number, supervisionsTask:number[]):Supervision[] {
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
    console.log("supervision", supervisions)
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

  computeSelectedTask(date:number) {
    let selectedTask: Task[] = []
    this.tasks!.forEach(task => this.computeSelectedTaskAction(selectedTask, date, task))
    return selectedTask
  }

  computeSelectedTaskAction(selectedTask:Task[], date:number, task:Task) {
    if (date == task.date) {
      selectedTask.push(task)
    }
  }

  constructor(private store: Store, private popup: PopupService, private cd: ChangeDetectorRef) {}
  
  swipemenu: boolean = false;

  @Select(DataQueries.currentProfile)
  currentProfile$!: Observable<Profile>;

  signContract() {
    this.popup.openSignContractDialog(this.mission!);
  }

  reloadMission = (dateOld:DateG): (DateG|Mission)[] =>  {
    let dateResult = dateOld
    this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
    this.dates.forEach(dateNew => {
      if (dateNew.value == dateOld.value) {
        dateResult = dateNew
      }
    })
    return [dateResult, this.mission!]
  }
}