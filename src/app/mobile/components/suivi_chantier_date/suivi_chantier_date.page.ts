import { Select, Store } from "@ngxs/store";
import { ChangeDetectionStrategy, Component, ChangeDetectorRef, Input} from "@angular/core";
import { Destroy$ } from "src/app/shared/common/classes";
import { Mission, DateG, Task } from "src/models/new/data.interfaces";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { DataQueries, DataState } from "src/models/new/data.state";
import { take } from "rxjs/operators";
import { ModifyDetailedPost, CreateSupervision, CreateDetailedPost, UploadImageSupervision } from "src/models/new/user/user.actions";
import { SuiviPME } from "../suivi_pme/suivi-pme.page";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

@Component({
    selector: 'suivi-chantier_date',
    templateUrl:"suivi_chantier_date.page.html",
    styleUrls:['suivi_chantier_date.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
  })

export class SuiviChantierDate extends Destroy${
  swipeMenu: boolean = false;
  swipeMenuImage: boolean = false;
  view: 'ST' | 'PME' = "PME";
  currentTaskId: (number | null) = null
  _reloadMission : (date:DateG) => (DateG|Mission)[] = (date:DateG): (DateG|Mission)[] => {return [this.date, this.mission!]}


  constructor(
    private cd: ChangeDetectorRef, private store: Store, private popup: PopupService
  ) {
    super()
  }

  _date: DateG = {id:0, value: 0, tasks:[], selectedTasks:[], taskWithoutDouble:[], view:this.view, supervisions: []};
  get date() { return this._date; }

  @Input()
  set date(date: DateG) {
    this._date = date;
  }

  _mission: Mission | null = null;
  get mission() { return this._mission; }

  @Input()
  set mission(mission: Mission | null) {
    this.view = this.store.selectSnapshot(DataState.view)
    this._mission = mission;
  }

  get reloadMission() { return this._reloadMission; }
  @Input()
    set reloadMission(callBack: (date:DateG) => any) {
      this._reloadMission = callBack
    }

  async takePhoto() {        
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    // this.store.dispatch(new ChangeProfilePicture(photo, 'image'));
    // scr = photo.format, imageBase64 = photo.base64String, 
  }

  async selectPhoto() {
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });
    this.store.dispatch(new UploadImageSupervision(photo, this.mission!.id, this.currentTaskId));
  }

  addDateToPost() {
    console.log("get mission", !this._mission!.isClosed); 
    this.popup.openDateDialog(this.mission!, this.date, this);
    this.swipeMenu = false
  }

  updatePage(content:string | null, missionId:number) {
    if (content) {
      this.store.dispatch(new CreateDetailedPost(missionId, content, this.date.value)).pipe(take(1)).subscribe(() => {
        this.updatePageOnlyDate()
      })
    } else {
      this.updatePageOnlyDate()
      document.getElementById("accordion") as HTMLImageElement;

    }
  }

  updatePageOnlyDate() {
    let [date, mission] = this._reloadMission(this.date)
    this.date = date as DateG
    this.mission = mission as Mission
  }

  validate(task: Task) {
    if (this.view == 'ST' && !task.refused && !this.mission!.isClosed) {
      task.validated = !task.validated
      this.store.dispatch(new ModifyDetailedPost(task)).pipe(take(1)).subscribe(() => {
        let control = document.getElementById("control_validate_"+task.id) as HTMLImageElement;
        control.src = SuiviPME.computeTaskImage(task, "validated")
      })
    }
  }

  refuse(task: Task) {
    if (this.view == 'ST' && !task.validated && !this.mission!.isClosed) {
      task.refused = !task.refused
      this.store.dispatch(new ModifyDetailedPost(task)).pipe(take(1)).subscribe(() => {
        this.mission = this.store.selectSnapshot(DataQueries.getById('Mission', this.mission!.id))
        let control = document.getElementById("control_refuse_"+task.id) as HTMLImageElement;
        control.src = SuiviPME.computeTaskImage(task, "refused")
      })
    }
  }

  mainComment(task:Task | null) {
    let idInput = task ? "input_"+task!.id : "input_general"
    let input = document.getElementById(idInput) as HTMLInputElement;
    this.currentTaskId = task ? task!.id : null
    if (input && !this.mission!.isClosed) {
      let detailPostId: number | null = task ? task.id : null
      this.store.dispatch(new CreateSupervision(this.mission!.id, detailPostId, null, input.value, this.date.value)).pipe(take(1)).subscribe(() => {
        this.updatePageOnlyDate()
      })
    }
  }
  
}