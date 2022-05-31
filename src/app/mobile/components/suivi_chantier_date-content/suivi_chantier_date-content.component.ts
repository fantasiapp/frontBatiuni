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
  PostDateAvailableTask,
  Mission,
  DatePost,
  PostDetail,
  PostDetailGraphic,
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

export interface TaskGraphic {
  selectedTask: PostDetailGraphic,
  formGroup: FormGroup
  validationImage : String
  invalidationImage : String
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

  @Input()
  reloadMission: (dateId: number) => (PostDateAvailableTask | Mission)[] = (
    dateId: number
  ): (PostDateAvailableTask | Mission)[] => {
    return [this.date, this.mission!];
  };

  // @Input()
  // _accordionOpen: boolean = false;
  // get accordionOpen(){  return this._accordionOpen}

  tasks!: Task[];
  dates!: PostDateAvailableTask[]

  tasksGraphic: TaskGraphic[] = [];

  ngOnInit(){
    // this.mission = this.store.selectSnapshot(DataQueries.getById("Mission", this.mission!.id))
    // this.computeDates(this.mission!)
    // this.popup.taskWithoutDouble.pipe(takeUntil(this.destroy$)).subscribe(tasks => {
    //   this.date.taskWithoutDouble = tasks;
    //   this.cd.markForCheck()
    // })
    // this.date = this.dates[this.date.id]
    this.computeTasks(this.date)
    console.log("chantier-date task", this.tasksGraphic)
  }

  computeTasks(date: PostDateAvailableTask){
    this.tasksGraphic = date.postDetails.map(postDetail => (
      {
        selectedTask:postDetail,
        validationImage: this.computeTaskImage(postDetail, "validated"),
        invalidationImage: this.computeTaskImage(postDetail, "refused"),
        formGroup: new FormGroup({comment: new FormControl()})
      }
    ))
    console.log("tasksGraphic", this.tasksGraphic)
  }

  computeSupervisions(postDetail: PostDetailGraphic) {
    console.log("computeSupervisions", postDetail.supervisions, Array.isArray(postDetail.supervisions), typeof(postDetail.supervisions))
    if ((typeof(postDetail.supervisions) === "object") && !Array.isArray(postDetail.supervisions)) {
      postDetail.supervisions = Object.values(postDetail.supervisions) as unknown as Supervision[]
    } else {
      postDetail.supervisions = this.store.selectSnapshot(DataQueries.getMany("Supervision", postDetail.supervisions as unknown as number[]))
      
    }
    return postDetail
  }

  computeTaskImage(task: PostDetailGraphic, type: String) {
    if (type === "validated") {
      if (task.validated && !task.refused) {
        return "assets/suivi-valider-OK.svg";
      } else {
        return "assets/suivi-valider.svg";
      }
    } else {
      if (!task.validated && task.refused) {
        return "assets/suivi-refuser-OK.svg";
      } else {
        return "assets/suivi-refuser.svg";
      }
    }
  }

  constructor(private cd: ChangeDetectorRef, private store: Store, private popup: PopupService) {
    super();
  }

  _date: PostDateAvailableTask = {id:-1, date:'', validated: false, deleted:false, supervisions: [], postDetails: [], allPostDetails:[]}
  get date() {
    return this._date;
  }

  @Input()
  set date(date: PostDateAvailableTask) {
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

  async takePhoto() {
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });
    this.store.dispatch(new UploadImageSupervision(photo, this.currentSupervisionId)).pipe(take(1)).subscribe(() => {
      // this.date.supervisions
      let mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
      this.updatePageOnlyDate();
      this.swipeMenuImage = false;
    });
  }

  async selectPhoto() {
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });

    this.store.dispatch(new UploadImageSupervision(photo, this.currentSupervisionId)).pipe(take(1)).subscribe(() => {
      let mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
      // let supervisions = this.store.selectSnapshot(DataQueries.getMany('Supervision', this.mission!.supervisions))
      this.updatePageOnlyDate();
      this.swipeMenuImage = false;
    });
  }

  addTaskToPost() {
    // this.popup.openDateDialog(this.mission!, this.date, this);
    // console.log("addTaskToPost", this.date)
    // this.swipeMenu = false;
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
    console.log("updatePageOnlyDate")
    let [date, mission] = this.reloadMission(this.date.id)
    this.date = date as PostDateAvailableTask
    this.computeTasks(date as PostDateAvailableTask)
    this.mission = mission as Mission
    this.cd.markForCheck()
  }

  validate(task: PostDetailGraphic, control: HTMLImageElement) {
    if (this.view == 'ST' && !task.refused && !this.mission!.isClosed) {
      task.validated = !task.validated
      this.store.dispatch(new ModifyDetailedPost(task)).pipe(take(1)).subscribe((mis) => {
        this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
        control.src = this.computeTaskImage(task, "validated")
      })
    }
  }

  refuse(task: PostDetailGraphic, control: HTMLImageElement) {
    if (this.view == 'ST' && !task.validated && !this.mission!.isClosed) {
      task.refused = !task.refused
      this.store.dispatch(new ModifyDetailedPost(task)).pipe(take(1)).subscribe(() => {
        this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
        control.src = this.computeTaskImage(task, "refused")
      })
    }
  }

  formMain = new FormGroup({
    commentMain: new FormControl("", [Validators.required]),
  });


  onSubmit( task: PostDetailGraphic| null, formGroup: FormGroup, formControlName: string){
    this.mainComment(task, formGroup, formControlName);
    this.cd.markForCheck()
  }
  textareaSubmit(e: any, input: HTMLFormElement){
    if(e.keyCode == 13){
      input.dispatchEvent(new Event("submit", {cancelable: true}))
      e.preventDefault(); // Prevents the addition of a new line in the text field (not needed in a lot of cases)
    }
  }
  
  mainComment(task:PostDetailGraphic | null, formGroup: FormGroup, formControlName: string) {
    let formControl = formGroup.get(formControlName)!
    let comment = formControl.value
    
    this.currentTaskId = task ? task!.id : null
    if (!this.mission!.isClosed) {
      let detailPostId: number | null = this.currentTaskId
      let datePostId: number | null = null;
      if (!detailPostId) {
        datePostId = this.date ? this.date.id : null
      }
      this.store.dispatch(new CreateSupervision(detailPostId, datePostId, comment)).pipe(take(1)).subscribe(() => {
        formControl.reset()
        this.updatePageOnlyDate()
      })
    }
  }

  currentSupervisionId: Ref<Supervision> | null = null
  cameraSwipe(supervsionId: Ref<Supervision> | null){
    this.currentSupervisionId = supervsionId;
    this.swipeMenuImage = true; 
    // this.currentTaskId = task ? task!.id : null
    this.cd.markForCheck()
  }

  //// DOUBLON
  //// Code egalement dans suivi-pme.page.ts, pas de callback pour eviter une propagation des changes
  //// Permet de reload localement le contenu d'un accordeon

  // reloadMission = (dateOld: PostDateAvailableTask): (PostDateAvailableTask | Mission)[] => {
  //   let dateResult = dateOld;
  //   let mission = this.store.selectSnapshot(DataQueries.getById("Mission", this.mission!.id));
  //   this.mission = mission;
  //   // this.computeDates(mission!);
  //   // this.dates?.forEach((dateNew) => {
  //   //   if (dateNew.date == dateOld.date!.date) {
  //   //     dateResult = dateNew;
  //   //   }
  //   // });
  //   return [dateResult, this.mission!];
  // };

  // computeDates(mission: Mission) {
    // let supervisionsTaks: number[] = [];
    // let detailsId = this.distToArray(mission.details);

    // this.tasks = this.store
    //   .selectSnapshot(DataQueries.getMany("DetailedPost", detailsId))
    //   ?.map((detail) => ({
    //     id: detail.id,
    //     date: detail.date,
    //     content: detail.content,
    //     validated: detail.validated,
    //     refused: detail.refused,
    //     supervisions: detail.supervisions,
    //     supervisionsObject: this.computeSupervisionsforTask(detail.supervisions, supervisionsTaks),
    //     validationImage: SuiviPME.computeTaskImage(detail, "validated"),
    //     invalidationImage: SuiviPME.computeTaskImage(detail, "refused"),
    //   }));
    // console.log("computeDates date", mission.dates)
    // let dates = mission.dates;
    // if (typeof mission.dates === "object" && !Array.isArray(mission.dates))
    //   dates = Object.keys(mission.dates).map((key) => +key as number);

    // this.dates = dates.map((value: any, id) => {

    //   let dates = value;
    //   if (typeof value === "object" && !Array.isArray(value))
    //     dates = Object.keys(value).map((key) => +key as number);
    //   let date = this.store.selectSnapshot(DataQueries.getById("DatePost", dates))!;
    //   let supervisionId = date.supervisions;
    //   if (typeof supervisionId === "object" && !Array.isArray(supervisionId))
    //     supervisionId = Object.keys(supervisionId).map((key) => +key as number);

    //   let supervisions = this.store.selectSnapshot(DataQueries.getMany("Supervision", supervisionId))
    //   console.log("computeDates, supervision", supervisions)
    //   let dateG = {
    //       id: id,
    //       date: date!,
    //       tasks: this.tasks,
    //       selectedTasks: this.computeSelectedTask(date!.date as string),
    //       taskWithoutDouble: this.dateWithoutDouble(),
    //       view: this.view,
    //       supervisions: supervisions,
    //     } as DateG;
    //   return dateG});
    //   this.dates.sort((date1, date2) => (date1.date.date > date2.date.date ? 1 : -1));
  // }

  computeDate(date:DatePost) {
    console.log(date)
    // if (typeof (mission.dates) === "object" && !Array.isArray(mission.dates)) dates = mission.dates
    // else dates = this.store.selectSnapshot(DataQueries.getMany("DatePost", mission.dates))
    // const allPostDetails = this.computeAllPostDetails(mission.details)
    // this.dates = dates.map((date) => {
    //   const [supervisions, postDetail] = this.computeFieldOfDate(date)
    //   return {
    //     "id":date.id,
    //     "date": date.date,
    //     "validated":date.validated,
    //     "deleted":date.deleted,
    //     "supervisions":supervisions,
    //     "postDetails":postDetail,
    //     "allPostDetails":allPostDetails
    //   } as unknown as PostDateAvailableTask
    // })
  }

  computeFieldOfDate(date:DatePost) {
    let supervisions:Supervision[] = []
    let postDetails:PostDetail[] = []
    let avaliableDetails:PostDetail[] = []
    if (typeof(date.supervisions) === "object" && !Array.isArray(date.supervisions))
      supervisions = Object.values(date.supervisions) as Supervision[]
    else
      supervisions = this.store.selectSnapshot(DataQueries.getMany("Supervision", date.supervisions))
      console.log("supervisions", supervisions, date.supervisions)

    if (typeof(date.details) === "object" && !Array.isArray(date.details))
      postDetails = Object.values(date.details)
    else
      postDetails = this.store.selectSnapshot(DataQueries.getMany("DetailedPost", date.details))

    let postDetailsGraphic = postDetails.map((postDetail) => {
      let supervisions:Supervision[]
      if ((typeof(postDetail.supervisions) === "object") && !Array.isArray(postDetail.supervisions)) {
        supervisions = Object.values(postDetail.supervisions) as unknown as Supervision[]
      } else {
        supervisions = this.store.selectSnapshot(DataQueries.getMany("Supervision", postDetail.supervisions as unknown as number[]))
      }
      return {
        "id": postDetail.id,
        "date": postDetail.date,
        "content": postDetail.content,
        "validated": postDetail.validated,
        "refused": postDetail.refused,
        "supervisions": supervisions,
      } as PostDetailGraphic
    })
    return [supervisions, postDetailsGraphic, avaliableDetails]
  }

  computeAllPostDetails(details:any[]) {
    let avaliableTasks: PostDetail[] = []
    if (typeof(details) === "object" && !Array.isArray(details)) avaliableTasks = details
    else avaliableTasks = this.store.selectSnapshot(DataQueries.getMany("DetailedPost", details))
    return avaliableTasks
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
    // let supervisionId = this.distToArray(this.mission!.supervisions);
    // let allSupervisions: (Supervision | null)[] = supervisionId.map((id) => {
    //   let supervision = this.store.selectSnapshot(DataQueries.getById("Supervision", id));
    //   if (supervision && supervision.date == date && !supervisionsTask.includes(supervision.id)) {
    //     return supervision;
    //   }
    //   return null;
    // });
    // for (let index in allSupervisions) {
    //   if (allSupervisions[index]) {
    //     supervisions.push(allSupervisions[index]!);
    //   }
    // }
    return supervisions;
  }
}
