import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewChild, ElementRef } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { take, takeLast } from "rxjs/operators";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { Company, Mission, PostDetail, Profile, Supervision } from "src/models/new/data.interfaces";
import { DataQueries, DataState } from "src/models/new/data.state";
import { ModifyDetailedPost } from "src/models/new/user/user.actions";


export type DateG = {
  id: number
  value: number
  isSelected: boolean
  tasks: Task[] | null
  selectedTasks: Task[]
}

export type Task = PostDetail & {validationImage:string, invalidationImage:string}

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
  subContractorName : string = ""
  update: boolean = true
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
      this.companyName  = this.subContractor!.name
      this.subContractorName = this.mission!.subContractorName
      
    }
  }

  computeDates (mission:Mission) {
    this.tasks = this.store.selectSnapshot(DataQueries.getMany('DetailedPost', mission.details)).map(detail => ({id:detail.id, date:detail.date, content:detail.content, validated:detail.validated, refused:detail.refused, supervisions:detail.supervisions, validationImage:this.computeTaskImage(detail, "validated"), invalidationImage:this.computeTaskImage(detail, "refused")}))
    console.log("tasks", this.tasks)
    // console.log("mission for date", mission)
    this.dates = mission.dates.map((value, id) => ({id:id, value: value, isSelected:true, tasks:this.tasks, selectedTasks:this.computeSelectedTask(value)}))
    // console.log("computeDates", this.dates, this.tasks)
  }

  computeTaskImage(task:PostDetail, type:String) {
    console.log("task image", task.content, task.validated, task.refused)
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


  swipemenuModify: boolean = false;

  @Select(DataQueries.currentProfile)
  currentProfile$!: Observable<Profile>;

  validate(task: Task) {
    if (this.view == 'ST' && !task.refused) {
      task.validated = !task.validated
      this.store.dispatch(new ModifyDetailedPost(task)).pipe(take(1)).subscribe(() => {
        this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
        let control = document.getElementById("control_validate_"+task.id) as HTMLImageElement;
        control.src = this.computeTaskImage(task, "validated")
      })
    }
  }

  refuse(task: Task) {
    console.log("refuse start", this.view, task.validated)
    if (this.view == 'ST' && !task.validated) {
      task.refused = !task.refused
      console.log("refuse", task)
      this.store.dispatch(new ModifyDetailedPost(task)).pipe(take(1)).subscribe(() => {
        this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
        this.store.dispatch(new ModifyDetailedPost(task)).pipe(take(1)).subscribe(() => {
          this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
          let control = document.getElementById("control_refuse_"+task.id) as HTMLImageElement;
          control.src = this.computeTaskImage(task, "refused")
        })
      })
    }
  }

  mainComment(task:Task | null) {
    if (task) {
      let input = document.getElementById("input_"+task!.id) as HTMLInputElement;
      console.log("mainComment", input.value)
    }
  }

  signContract() {
    this.popup.openSignContractDialog(this.mission!);
  }

  addDateToPost() {
    let date = this.dates[this.currentDateId!]
    date.isSelected = !date.isSelected
    this.swipemenuModify = false
  }

  swipemenuModifyAction(dateId:any) {
    this.swipemenuModify = true
    this.currentDateId = dateId
    console.log("swipemenuModifyAction", dateId)

  }

  modifyDetailedPostDate(task:PostDetail, date:any) {
    task!.date = date.value
    this.store.dispatch(new ModifyDetailedPost(task)).pipe(take(1)).subscribe(() => {
      this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
      this.update=false
      this.cd.markForCheck();
      this.update=true
      this.cd.markForCheck();
    });
  }
}