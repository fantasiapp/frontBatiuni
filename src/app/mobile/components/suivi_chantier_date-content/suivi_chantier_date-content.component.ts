import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { FormControl, FormGroup, FormGroupName, Validators } from "@angular/forms";
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import { Store } from "@ngxs/store";
import { take } from "rxjs/internal/operators/take";
import { takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { InfoService } from "src/app/shared/components/info/info.component";
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
  User,
} from "src/models/new/data.interfaces";
import { DataQueries, DataState } from "src/models/new/data.state";
import {
  CreateDetailedPost,
  CreateSupervision,
  ModifyDetailedPost,
  UploadImageSupervision,
  ValidateMissionDate,
} from "src/models/new/user/user.actions";
import { getUserDataService } from "src/app/shared/services/getUserData.service";
import { Mobile } from "src/app/shared/services/mobile-footer.service";
import { UICheckboxComponent } from "src/app/shared/components/box/checkbox.component";
import { delay } from "src/app/shared/common/functions";


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
  providers: [Mobile]
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

  showFooter: boolean = true;

  // @Input()
  // _accordionOpen: boolean = false;
  // get accordionOpen(){  return this._accordionOpen}

  tasks!: Task[];
  // date!: DatePost

  tasksGraphic: TaskGraphic[] = [];

  user!: User;

  constructor(public mobile: Mobile, private cd: ChangeDetectorRef, private store: Store, private popup: PopupService, private getUserDataService: getUserDataService, private info: InfoService) {
    super();
  }

  ngOnInit(){
    

    this.user = this.store.selectSnapshot(DataQueries.currentUser)
    this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))

    this.updatePageOnlyDate()

    this.popup.addPostDetail.pipe(takeUntil(this.destroy$)).subscribe(newPostDetail => {
      this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))!
      this.updatePageOnlyDate()
      this.cd.markForCheck()
    })

    this.popup.modifyPostDetail.pipe(takeUntil(this.destroy$)).subscribe(curPostDetail => {
      // this.updatePageOnlyDate()
      if(curPostDetail.checked && curPostDetail.date == this.dateOrigin.date){
        this.tasksGraphic.push({
          selectedTask:curPostDetail,
          validationImage: this.computeTaskImage(curPostDetail, "validated"),
          invalidationImage: this.computeTaskImage(curPostDetail, "refused"),
          formGroup: new FormGroup({comment: new FormControl()})
        })
      } else {
        this.tasksGraphic = this.tasksGraphic.filter(task => task.selectedTask.content != curPostDetail.content)
        this.date.postDetails = this.date.postDetails.filter(postdetail => postdetail.content != curPostDetail.content)
      }

      this.tasksGraphic = this.tasksGraphic.filter(task => task.selectedTask.checked)


      this.updatePageOnlyDate()
      this.cd.markForCheck()
    })
  }


  computeDate(date:DatePost) {
    const [supervisions, postDetails] = this.computeFieldOfDate(date)
    this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
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
    this.dateOrigin = this.store.selectSnapshot(DataQueries.getById('DatePost', date.id))!
    let supervisions:Supervision[] = []
    let postDetails:PostDetail[] = []
    let avaliableDetails:PostDetail[] = []
    if (typeof(date.supervisions) === "object" && !Array.isArray(this.dateOrigin.supervisions))
      supervisions = Object.values(this.dateOrigin.supervisions) as Supervision[]
    else
      supervisions = this.store.selectSnapshot(DataQueries.getMany("Supervision", this.dateOrigin.supervisions))

    let postDetailsId = []
    if (!Array.isArray(this.dateOrigin.details)) postDetailsId = Object.keys(this.dateOrigin.details).map(detail => +detail)
    else postDetailsId = this.dateOrigin.details
    
    postDetails = this.store.selectSnapshot(DataQueries.getMany("DetailedPost", postDetailsId))
    
    let postDetailsGraphic = postDetails.map((postDetail) => {
      console.log('postDetail compute Field', postDetail);
      let supervisions:Supervision[]
      if ((typeof(postDetail.supervisions) === "object") && !Array.isArray(postDetail.supervisions)) {
        supervisions = Object.values(postDetail.supervisions) as unknown as Supervision[]
      } else {
        supervisions = this.store.selectSnapshot(DataQueries.getMany("Supervision", postDetail.supervisions as unknown as number[]))
      } return {
        "id": postDetail.id,
        "date": this.dateOrigin.date,
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
    const selectedContentId = postDetails.map((detail) => { return { 
        [detail.content]: detail.id
      }
    })
    return avaliableTasks.map((task) => {
      const checked = selectedContent.includes(task.content)
      const content : string = task.content
      let selected = selectedContentId.filter(s => !!s[content])[0]
      const id = selected && selected.hasOwnProperty(content) ? selected[content] : task.id
      return {
        "id": id,
        "date": this.dateOrigin.date,
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
        selectedTask: postDetail,
        validationImage: this.computeTaskImage(postDetail, "validated"),
        invalidationImage: this.computeTaskImage(postDetail, "refused"),
        formGroup: new FormGroup({comment: new FormControl()})
      }
      ))
    console.log('this.tasksGraphic', this.tasksGraphic);
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

  
  swipePhoto?: {
    task: PostDetailGraphic | null,
    taskGraphic: TaskGraphic | null
  }

  async takePhoto() {
    const photo = await Camera.getPhoto({
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });

      
    console.log('TAKE PHOTO');
    this.mainComment(this.swipePhoto!.task, this.swipePhoto!.taskGraphic,photo)
      // this.updatePageOnlyDate();
    this.swipeMenuImage = false;
  }

  async selectPhoto() {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      presentationStyle: 'fullscreen',
      webUseInput: true,
      quality: 90,
      allowEditing: true,
      saveToGallery: true
    });

    console.log('TAKE PHOTO');
    this.mainComment(this.swipePhoto!.task, this.swipePhoto!.taskGraphic,photo)
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


  // onSubmit( task: PostDetailGraphic| null, formGroup: FormGroup, formControlName: string){
  //   this.mainComment(task, formGroup, formControlName);
  //   this.cd.markForCheck()
  // }
  textareaSubmit(e: any, input: HTMLFormElement){
    if(e.keyCode == 13){
      input.dispatchEvent(new Event("submit", {cancelable: true}))
      e.preventDefault(); // Prevents the addition of a new line in the text field (not needed in a lot of cases)
    }
  }
  
  mainComment(task:PostDetailGraphic | null, taskGraphic: TaskGraphic | null, photo: Photo) {
    if (!this.mission!.isClosed) {
      let detailPostId: number | null = task ? task.id : null
      let datePostId: number | null = null;
      if (!detailPostId) {
        datePostId = this.dateOrigin.id
      }
      try {
        console.log('create Supervision variable', detailPostId, datePostId);
        this.store.dispatch(new CreateSupervision(detailPostId, datePostId, "")).pipe(take(1)).subscribe((response) => {
          // this.updatePageOnlyDate()
          let supervisions: Supervision[];
          if(detailPostId){
            console.log('detailPostID', detailPostId);
            let postDetail = this.store.selectSnapshot(DataQueries.getById('DetailedPost', detailPostId))!
            supervisions = this.store.selectSnapshot(DataQueries.getMany('Supervision', postDetail.supervisions))
            taskGraphic!.selectedTask.supervisions = supervisions
          } else {
            this.dateOrigin = this.store.selectSnapshot(DataQueries.getById('DatePost', this.dateOrigin.id))!
            supervisions = this.store.selectSnapshot(DataQueries.getMany('Supervision', this.dateOrigin.supervisions))!
          }
          console.log(supervisions, photo);

          this.store.dispatch(new UploadImageSupervision(photo, supervisions[supervisions.length - 1].id)).pipe(take(1)).subscribe(() => {
            this.swipeMenuImage = false;
            supervisions[supervisions.length - 1] = this.store.selectSnapshot(DataQueries.getById('Supervision', supervisions[supervisions.length - 1].id))! 
            console.log('NEW SUPERVISION ', supervisions);

            if(detailPostId){
              this.date.postDetails.forEach(Detail =>{
                console.log('detail', Detail);
                if(Detail.id === detailPostId) Detail.supervisions = supervisions 
              })
            } else {
              this.dateOrigin = this.store.selectSnapshot(DataQueries.getById('DatePost', this.dateOrigin.id))!
              supervisions = this.store.selectSnapshot(DataQueries.getMany('Supervision', this.dateOrigin.supervisions))!
              this.date.supervisions = supervisions
            }

            console.log('this.date;', this.date);
            this.updatePageOnlyDate()
          });
        })
      } catch {
        this.getUserDataService.emitDataChangeEvent()
      }
    }

  }

  currentSupervisionId: Ref<Supervision> | null = null
  cameraSwipe(supervsionId: Ref<Supervision> | null){
    this.currentSupervisionId = supervsionId;
    this.swipeMenuImage = true; 
    this.cd.markForCheck()
  }

  @Output() computeDates: EventEmitter<any> = new EventEmitter();

  deleted(b: boolean, deleting: boolean) {
    let field = "date";
    
    this.store.dispatch(new ValidateMissionDate(this.mission!.id, field, b, this.date.date)).pipe().subscribe(() => {
      this.date.deleted = b
      this.cd.markForCheck()
      if(b) this.computeDates.next()
    });
  }

  slideCommentOpen = false

  slideCommentMenu: slideCommentMenu = {
    taskGraphic: null,
    slideCommentOpen: false,
    supervisions: [],
    selectedTask: null
  }

  slideComment(taskGraphic: TaskGraphic | null, e: Event, supervisions: Supervision[], selectedTask: PostDetailGraphic | null){
    e.preventDefault()
    this.slideCommentOpen = true
    console.log('this.slideCommentOpen', this.slideCommentOpen);
    this.slideCommentMenu = {
      taskGraphic: taskGraphic,
      slideCommentOpen: true,
      supervisions: supervisions,
      selectedTask: selectedTask
    }
  }
  refreshMainComment(supervisions : Supervision[] | null){
    if(!supervisions) return
    this.date.supervisions = supervisions
  }
  
  taskMenuUp: boolean = false
  
  slideNewTaskManager: boolean = false;

  taskSubmit(e:Event, form: HTMLFormElement, input: HTMLInputElement) {
    if(!input.value || input.value.trim() == '') return
    form.dispatchEvent(new Event("submit", {cancelable: true}))
    e.preventDefault(); // Prevents the addition of a new line in the text field (not needed in a lot of cases)
  }

  taskManager(e:Event, b: boolean){
    e.stopPropagation()
    this.taskMenuUp = b

    if(b) {
      this.updatePageOnlyDate()

    }
  }

  computeValidateTask(){
    for (const detailPost of this.pendingDetailedPost) {
      this.modifyDetailedPostDate(detailPost)
    }

    this.taskMenuUp = false;
    this.pendingDetailedPost = []
  }

  pendingDetailedPost: PostDetailGraphic[] = []
  addDetailedPostPending(detailedPost : PostDetailGraphic, checkbox: UICheckboxComponent, e:Event){
    if (checkbox.value){
      this.pendingDetailedPost = this.pendingDetailedPost.filter(detailpost => detailpost != detailedPost )
    } else {
      this.pendingDetailedPost.push(detailedPost)
    }
    checkbox.value = !checkbox.value
    
    console.log('pendingDetailedPost', this.pendingDetailedPost)
  }

  computeNewTasks(newTasks: string[]){
    for (const newTask of newTasks) {
      this.store.dispatch(new CreateDetailedPost(this.mission!.id, newTask, this.dateId)).pipe(take(1)).subscribe(() => {
        this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))!
        const missionPostDetail = this.store.selectSnapshot(DataQueries.getMany("DetailedPost", this.mission!.details)) as Task[];
        const newTask = missionPostDetail[missionPostDetail.length - 1];
        const newTaskSupervision = this.store.selectSnapshot(DataQueries.getMany("Supervision", newTask.supervisions))
        const detailDate: PostDetailGraphic = {
          id: newTask.id,
          date: this.date.date,
          content: newTask.content,
          validated: newTask.validated,
          refused: newTask.refused,
          supervisions: newTaskSupervision,
          checked: true
        }
        
        this.updateTaskGraphic(detailDate)
        this.updatePageOnlyDate()
        this.cd.markForCheck()
      })
    }

    this.slideNewTaskManager = false
  }

  modifyDetailedPostDate(detailedPost: PostDetailGraphic) {
    this.store.dispatch(new ModifyDetailedPost(detailedPost, false, this.dateId)).pipe(take(1)).subscribe(result => {
      detailedPost.checked = true
      detailedPost.date = this.dateOrigin.date

      this.updateTaskGraphic(detailedPost)
      
    })
  }

  updateTaskGraphic(detailedPost: PostDetailGraphic){
    if(detailedPost.checked && detailedPost.date == this.dateOrigin.date){
      this.tasksGraphic.push({
        selectedTask:detailedPost,
        validationImage: this.computeTaskImage(detailedPost, "validated"),
        invalidationImage: this.computeTaskImage(detailedPost, "refused"),
        formGroup: new FormGroup({comment: new FormControl()})
      })
    } else {
      this.tasksGraphic = this.tasksGraphic.filter(task => task.selectedTask.content != detailedPost.content)
      this.date.postDetails = this.date.postDetails.filter(postdetail => postdetail.content != detailedPost.content)
    }

    this.tasksGraphic = this.tasksGraphic.filter(task => task.selectedTask.checked)

    this.cd.markForCheck()

  }
}


export interface slideCommentMenu {
  taskGraphic: TaskGraphic | null,
  slideCommentOpen: boolean,
  supervisions: Supervision[],
  selectedTask: PostDetailGraphic | null
}

export interface assignDateType {
  missionId: Ref<Mission>;
  date: PostDateAvailableTask;
  datePostId: Ref<DatePost>;
  view: "ST" | "PME";
}