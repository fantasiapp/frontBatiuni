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
  // datePost: DatePost | null = null

  @Input()
  view: "ST" | "PME" = "PME";
  currentTaskId: number | null = null;

  @Input()
  dateOrigin:DatePost = {id:-1, date:'', validated: false, deleted:false, supervisions: [], details: []}

  @Input()
  dateId:number = -1

  @Input()
  mission: Mission | null = null;

  date:PostDateAvailableTask = {id:5, date:'12-12-2022', validated: false, deleted:false, supervisions: [], postDetails: [], allPostDetails: []}

  // @Input()
  // _accordionOpen: boolean = false;
  // get accordionOpen(){  return this._accordionOpen}

  tasks!: Task[];
  // date!: DatePost

  tasksGraphic: TaskGraphic[] = [];

  ngOnInit(){
    this.updatePageOnlyDate()

    this.popup.modifyPostDetailList.pipe(takeUntil(this.destroy$)).subscribe(curPostDetail => {
      // this.updatePageOnlyDate()
      const postDetailG = curPostDetail
      let a = false
      for (const taskGraphic of this.tasksGraphic) {
        if(taskGraphic.selectedTask.id == postDetailG.id) {
          taskGraphic.selectedTask.checked = postDetailG.checked
          a =true
        }
      }
      if (!a) {
        this.tasksGraphic.push({
          selectedTask:postDetailG,
          validationImage: this.computeTaskImage(postDetailG, "validated"),
          invalidationImage: this.computeTaskImage(postDetailG, "refused"),
          formGroup: new FormGroup({comment: new FormControl()})
        })
      }
    })
  }


  computeDate(date:DatePost) {
    const [supervisions, postDetails] = this.computeFieldOfDate(date)
    const allPostDetails = this.computeAllPostDetails(this.mission!.details, postDetails as unknown as PostDetailGraphic[])
    this.date = {
      "id":date.id,
      "date": date.date,
      "validated":date.validated,
      "deleted":date.deleted,
      "supervisions":supervisions,
      "postDetails":postDetails,
      "allPostDetails":allPostDetails
    } as unknown as PostDateAvailableTask
  }

  computeFieldOfDate(date:DatePost) {
    let supervisions:Supervision[] = []
    let postDetails:PostDetail[] = []
    let avaliableDetails:PostDetail[] = []
    if (typeof(date.supervisions) === "object" && !Array.isArray(date.supervisions))
      supervisions = Object.values(date.supervisions) as Supervision[]
    else
      supervisions = this.store.selectSnapshot(DataQueries.getMany("Supervision", date.supervisions))

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
        "checked": true
      } as PostDetailGraphic
    })
    return [supervisions, postDetailsGraphic]
  }

  computeAllPostDetails(details:any[], postDetails:PostDetailGraphic[]) {
    let avaliableTasks: PostDetail[] = []
    if (typeof(details) === "object" && !Array.isArray(details)) avaliableTasks = details
    else avaliableTasks = this.store.selectSnapshot(DataQueries.getMany("DetailedPost", details))
    const selectedContent = postDetails.map((detail) => detail.content)
    return avaliableTasks.map((task) => {
      const checked = selectedContent.includes(task.content)
      return {
        "id":task.id,
        "date":task.date,
        "content": task.content,
        "validated": task.validated,
        "refused": task.refused,
        "supervisions": [],
        "checked": checked
        } as PostDetailGraphic
    })
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
  }

  computeSupervisions(postDetail: PostDetailGraphic) {
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

  async takePhoto() {
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });
    this.store.dispatch(new UploadImageSupervision(photo, this.currentSupervisionId)).pipe(take(1)).subscribe(() => {
      // this.date.supervisions
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
      // let supervisions = this.store.selectSnapshot(DataQueries.getMany('Supervision', this.mission!.supervisions))
      this.updatePageOnlyDate();
      this.swipeMenuImage = false;
    });
  }

  addTaskToPost() {
    this.popup.openDateDialog(this.mission!.id, this.date, this.dateOrigin.id, this);
    this.swipeMenu = false;
  }

  updatePage(content: any) {
    if (content) {

      // Query pour update la page lorsque l'on rajoute des task a une journee en pme, est call seulement vensant de popup
      // this.store.dispatch(new CreateDetailedPost(this.dateQuelquechose, content)).pipe(take(1)).subscribe(() => {
        this.updatePageOnlyDate()
      // })
    } else {
    this.updatePageOnlyDate();
    }
  }

  updatePageOnlyDate() {
    this.dateOrigin = this.store.selectSnapshot(DataQueries.getById('DatePost', this.dateOrigin.id))!
    this.computeDate( this.dateOrigin)
    this.computeTasks(this.date)
    this.cd.markForCheck()
  }

  validate(task: PostDetailGraphic, control: HTMLImageElement) {
    if (this.view == 'ST' && !task.refused && !this.mission!.isClosed) {
      task.validated = !task.validated
      this.store.dispatch(new ModifyDetailedPost(task, false, this.dateOrigin.id)).pipe(take(1)).subscribe((mis) => {
        this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
        control.src = this.computeTaskImage(task, "validated")
      })
    }
  }

  refuse(task: PostDetailGraphic, control: HTMLImageElement) {
    if (this.view == 'ST' && !task.validated && !this.mission!.isClosed) {
      task.refused = !task.refused
      this.store.dispatch(new ModifyDetailedPost(task, false, this.dateOrigin.id)).pipe(take(1)).subscribe(() => {
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
    
    if (!this.mission!.isClosed) {
      let detailPostId: number | null = task ? task.id : null
      let datePostId: number | null = null;
      if (!detailPostId) {
        datePostId = this.dateOrigin.id
      }
      this.store.dispatch(new CreateSupervision(detailPostId, datePostId, comment)).pipe(take(1)).subscribe((response) => {
        formControl.reset()

        
        this.updatePageOnlyDate()
      })
    }
  }

  currentSupervisionId: Ref<Supervision> | null = null
  cameraSwipe(supervsionId: Ref<Supervision> | null){
    this.currentSupervisionId = supervsionId;
    this.swipeMenuImage = true; 
    this.cd.markForCheck()
  }
}