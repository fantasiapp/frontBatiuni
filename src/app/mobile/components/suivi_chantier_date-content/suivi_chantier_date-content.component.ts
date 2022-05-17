import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Store } from "@ngxs/store";
import { take } from "rxjs/internal/operators/take";
import { takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import {
  DateG,
  Mission,
  Ref,
  Supervision,
  Task,
} from "src/models/new/data.interfaces";
import { DataQueries, DataState } from "src/models/new/data.state";
import {
  CreateDetailedPost,
  CreateSupervision,
  ModifyDetailedPost,
  UploadImageSupervision,
} from "src/models/new/user/user.actions";
import { SuiviPME } from "../suivi_pme/suivi-pme.page";

export interface iterableTasksComment {
  selectedTask: Task,
  formGroup: FormGroup
}

@Component({
  selector: "suivi-chantier-date-content",
  templateUrl: "./suivi_chantier_date-content.component.html",
  styleUrls: ["./suivi_chantier_date-content.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuiviChantierDateContentComponent extends Destroy$ {
  swipeMenu: boolean = false;
  swipeMenuImage: boolean = false;

  @Input()
  view: "ST" | "PME" = "PME";
  currentTaskId: number | null = null;
  _reloadMission: (date: DateG) => (DateG | Mission)[] = (
    date: DateG
  ): (DateG | Mission)[] => {
    return [this.date, this.mission!];
  };

  // @Input()
  // _accordionOpen: boolean = false;
  // get accordionOpen(){  return this._accordionOpen}

  tasks!: Task[];
  dates!: DateG[]

  iterableTasksComment: iterableTasksComment[] = [];



  ngOnInit(){
    console.log('ngOnInit début, date', this.date)
    this.mission = this.store.selectSnapshot(DataQueries.getById("Mission", this.mission!.id))
    this.computeDates(this.mission!)
    console.log('ngOnInit finito mais pas tout a fait en fait , date', this.date)
    this.popup.taskWithoutDouble.pipe(takeUntil(this.destroy$)).subscribe(tasks => {
      this.date.taskWithoutDouble = tasks;
      this.cd.markForCheck()
    })
    this.date = this.dates[this.date.id]
    this.computeIterable(this.date)
    console.log('ngOnInit finito, date', this.date)
  }

  computeIterable(date: DateG){
    this.iterableTasksComment = date.selectedTasks.map(task => (
      {
        selectedTask:task, 
        formGroup: new FormGroup({comment: new FormControl()}) 
      }
    ))
  }

  constructor(
    private cd: ChangeDetectorRef,
    private store: Store,
    private popup: PopupService
  ) {
    super();
  }

  _date: DateG = {
    id: 0,
    value: "1970:01:01",
    tasks: [],
    selectedTasks: [],
    taskWithoutDouble: [],
    view: this.view,
    supervisions: [],
  };
  get date() {
    return this._date;
  }

  @Input()
  set date(date: DateG) {
    this._date = date;
  }

  _mission!: Mission | null;
  get mission() {
    return this._mission;
  }

  @Input()
  set mission(mission: Mission | null) {
    // this.view = this.store.selectSnapshot(DataState.view)
    this._mission = mission;
  }

  async takePhoto(taskId: Ref<Task> | null) {
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });
    this.store.dispatch(new UploadImageSupervision(photo, this.mission!.id, this.currentTaskId)).pipe(take(1)).subscribe(() => {
      // this.date.supervisions
      let mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
      console.log('mission', mission);
      this.updatePageOnlyDate();
      this.swipeMenuImage = false;
    });
  }

  async selectPhoto(taskId: Ref<Task> | null) {
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });
    this.store.dispatch(new UploadImageSupervision(photo, this.mission!.id, taskId)).pipe(take(1)).subscribe(() => {
      let mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
      let supervisions = this.store.selectSnapshot(DataQueries.getMany('Supervision', this.mission!.supervisions))
      console.log('mission', mission, supervisions);
      this.updatePageOnlyDate();
      this.swipeMenuImage = false;
    });
  }

  addDateToPost() {
    this.popup.openDateDialog(this.mission!, this.date, this);
    this.swipeMenu = false;
  }

  updatePage(content: string | null, missionId: number) {
    // if (content) {
    //   this.store.dispatch(new CreateDetailedPost(missionId, content, this.date.value)).pipe(take(1)).subscribe(() => {
    //     this.updatePageOnlyDate()
    //   })
    // } else {
    this.updatePageOnlyDate();
    // document.getElementById("accordion") as HTMLImageElement;
    // }
  }

  updatePageOnlyDate() {
    let [date, mission] = this.reloadMission(this.date)
    this.date = date as DateG
    this.computeIterable(date as DateG)
    this.mission = mission as Mission
    this.cd.markForCheck()
  }

  validate(task: Task, control: HTMLImageElement) {
    if (this.view == 'ST' && !task.refused && !this.mission!.isClosed) {
      task.validated = !task.validated
      this.store.dispatch(new ModifyDetailedPost(task)).pipe(take(1)).subscribe((mis) => {
        this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
        control.src = SuiviPME.computeTaskImage(task, "validated")
      })
    }
  }

  refuse(task: Task, control: HTMLImageElement) {
    if (this.view == 'ST' && !task.validated && !this.mission!.isClosed) {
      task.refused = !task.refused
      this.store.dispatch(new ModifyDetailedPost(task)).pipe(take(1)).subscribe(() => {
        this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
        control.src = SuiviPME.computeTaskImage(task, "refused")
      })
    }
  }

  

  formMain = new FormGroup({
    commentMain: new FormControl("", [Validators.required]),
  });


  onSubmit( task: Task| null, inputEl: HTMLTextAreaElement | HTMLInputElement){
    this.mainComment(task, inputEl);
    this.cd.markForCheck()
  }
  textareaSubmit(e: KeyboardEvent,input: HTMLFormElement){
    if(e.key == 'Enter'){
      input.dispatchEvent(new Event("submit", {cancelable: true}))
      e.preventDefault(); // Prevents the addition of a new line in the text field (not needed in a lot of cases)
    }
  }
  mainComment(task:Task | null, inputEl: HTMLTextAreaElement | HTMLInputElement) {
    // let idInput = task ? "input_"+task!.id : "input_general"
    let input = inputEl
    this.currentTaskId = task ? task!.id : null
    if (input.value.trim() != '' && !this.mission!.isClosed) {
      let detailPostId: number | null = task ? task.id : null
      this.store.dispatch(new CreateSupervision(this.mission!.id, detailPostId, null, input.value, this.date.value)).pipe(take(1)).subscribe(() => {
        input.value = ''
        this.updatePageOnlyDate()
      })
    }
  }

  //// DOUBLON
  //// Code egalement dans suivi-pme.page.ts, pas de callback pour eviter une propagation des changes
  //// Permet de reload localement le contenu d'un accordeon

  reloadMission = (dateOld: DateG): (DateG | Mission)[] => {
    let dateResult = dateOld;
    let mission = this.store.selectSnapshot(DataQueries.getById("Mission", this.mission!.id));
    this.mission = mission;
    this.computeDates(mission!);
    console.log('reloadMission, date.supervision :', this.dates)
    this.dates?.forEach((dateNew) => {
      if (dateNew.value == dateOld.value) {
        dateResult = dateNew;
      }
    console.log('reloadMission, date.supervision :', this.dates)
    });

    return [dateResult, this.mission!];
  };

  computeDates(mission: Mission) {
    let supervisionsTaks: number[] = [];
    let detailsId = this.distToArray(mission.details);

    this.tasks = this.store
      .selectSnapshot(DataQueries.getMany("DetailedPost", detailsId))
      ?.map((detail) => ({
        id: detail.id,
        date: detail.date,
        content: detail.content,
        validated: detail.validated,
        refused: detail.refused,
        supervisions: detail.supervisions,
        supervisionsObject: this.computeSupervisionsforTask(detail.supervisions, supervisionsTaks),
        validationImage: SuiviPME.computeTaskImage(detail, "validated"),
        invalidationImage: SuiviPME.computeTaskImage(detail, "refused"),
      }));
      console.log("computesDates", this.tasks)
    let dates = mission.dates;
    if (typeof mission.dates === "object" && !Array.isArray(mission.dates))
      dates = Object.keys(mission.dates).map((key) => +key as number);

    this.dates = dates.map((value: unknown, id) => {
      let date = typeof value == "number"? this.store.selectSnapshot(DataQueries.getById("DatePost", value as number))!.date : value;
      return {
        id: id,
        value: date as string,
        tasks: this.tasks,
        selectedTasks: this.computeSelectedTask(date as string),
        taskWithoutDouble: this.dateWithoutDouble(),
        view: this.view,
        supervisions: this.computeSupervisionsForMission(date as string,supervisionsTaks),
      } as DateG;
    });
      console.log("dates", this.dates)
      this.dates.sort((date1, date2) => (date1.value > date2.value ? 1 : -1));
      console.log("dates 2 ", this.dates)
  }

  computeSupervisionsforTask(supervisionsId: number[], supervisionsTask: number[]) {
    let supervisions: Supervision[] = [];
    // let supervisionId = this.distToArray(supervisionsId)
    supervisionsId.forEach((id) => {
      let supervision = this.store.selectSnapshot(
        DataQueries.getById("Supervision", id)
      );
      if (supervision) {
        supervisions.push(supervision!);
        supervisionsTask.push(supervision.id);
      }
    });
    return supervisions;
  }

  computeSelectedTask(date: string) {
    let selectedTask: Task[] = [];
    this.tasks?.forEach((task) =>
      this.computeSelectedTaskAction(selectedTask, date, task)
    );
    return selectedTask;
  }
  computeSelectedTaskAction(selectedTask: Task[], date: string, task: Task) {
    if (date == task.date) {
      selectedTask.push(task);
    }
  }

  dateWithoutDouble(): Task[] {
    let listWithOutDouble: Task[] = [];
    let listWithOutDoubleStr: string[] = [];
    if (this.tasks) {
      let dictionary = Object.assign(
        {},
        ...this.tasks!.map((task) => ({ [task.content]: task }))
      );
      Object.keys(dictionary).forEach((key) => {
        if (!listWithOutDoubleStr.includes(dictionary[key])) {
          listWithOutDouble.push(dictionary[key]);
          listWithOutDoubleStr.push(key);
        }
      });
    }
    return listWithOutDouble;
  }

  distToArray(dist: any) {
    let arr;
    if (Array.isArray(dist)) arr = dist;
    else arr = Object.keys(dist).map((key) => +key as number);
    return arr;
  }

  computeSupervisionsForMission(date: string, supervisionsTask: number[]): Supervision[] {
    let supervisions: Supervision[] = [];
    let supervisionId = this.distToArray(this.mission!.supervisions);
    let allSupervisions: (Supervision | null)[] = supervisionId.map((id) => {
      let supervision = this.store.selectSnapshot(DataQueries.getById("Supervision", id));
      if (supervision && supervision.date == date && !supervisionsTask.includes(supervision.id)) {
        return supervision;
      }
      return null;
    });
    for (let index in allSupervisions) {
      if (allSupervisions[index]) {
        supervisions.push(allSupervisions[index]!);
      }
    }
    return supervisions;
  }
}
