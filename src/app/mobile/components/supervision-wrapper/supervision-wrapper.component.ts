import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Store } from '@ngxs/store';
import * as moment from 'moment';
import { take, takeUntil } from 'rxjs/operators';
import { Destroy$ } from 'src/app/shared/common/classes';
import { InfoService } from 'src/app/shared/components/info/info.component';
import { Mobile } from 'src/app/shared/services/mobile-footer.service';
import { DatePost, Mission, PostDetail, PostDetailGraphic, Ref, Supervision } from 'src/models/new/data.interfaces';
import { DataQueries } from 'src/models/new/data.state';
import { CreateSupervision, UploadImageSupervision } from 'src/models/new/user/user.actions';
import { TaskGraphic } from '../suivi_chantier_date-content/suivi_chantier_date-content.component';

@Component({
  selector: 'app-supervision-wrapper',
  templateUrl: './supervision-wrapper.component.html',
  styleUrls: ['./supervision-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Mobile]
})
export class SupervisionWrapperComponent extends Destroy$ {

  @Input() taskGraphic: TaskGraphic | null = null
  @Input() mission!: Mission
  @Input() dateOrigin!: DatePost
  // @Input() formControlName!: string
  @Input() selectedTask: PostDetailGraphic | null = null
  @Input() supervisions: Supervision[] = []
  showFooter: boolean = true;
  swipeMenuImage: boolean = false;
  sendButtonShow: boolean = false;
  dateShow: string = ''
  taskShow: string = ''
  platform: string = ''

  @Output() closeSwipe = new EventEmitter<Supervision[] | null>()


  constructor(public mobile: Mobile, private cd: ChangeDetectorRef, private store: Store, private info: InfoService) {
    super()
  }
  


  ngOnInit(): void {
    this.dateShow = this.dateOrigin.date
    this.dateShow = moment(this.dateShow).locale('fr').format('DD-MM-YYYY')

    if(this.taskGraphic) this.taskShow = this.taskGraphic.selectedTask.content
    

    this.mobile.init()
    this.mobile.footerStateSubject.pipe(takeUntil(this.destroy$)).subscribe(b => {
      this.showFooter = b
      this.cd.detectChanges()
    })
    this.platform = this.mobile.plateform
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  formMain = new FormGroup({
    inputComment: new FormControl("", [Validators.required]),
  });

  onSubmit( task: PostDetailGraphic| null, formGroup: FormGroup, formControlName: string, input: HTMLTextAreaElement){
    let formControl = formGroup.get(formControlName)!
    let comment = formControl.value
    if(!comment || comment.trim() == '') return
    if (!this.mission!.isClosed) {
      let detailPostId: number | null = task ? task.id : null
      let datePostId: number | null = null;
      if (!detailPostId) {
        datePostId = this.dateOrigin.id
      }
      try {
        this.store.dispatch(new CreateSupervision(detailPostId, datePostId, comment)).pipe(take(1)).subscribe((response) => {
          formControl.reset()
          let supervisions: Supervision[];
          if(this.selectedTask){
            let postDetail = this.store.selectSnapshot(DataQueries.getById('DetailedPost', this.selectedTask.id))!
            supervisions = this.store.selectSnapshot(DataQueries.getMany('Supervision', postDetail.supervisions))
            this.taskGraphic!.selectedTask.supervisions = supervisions
          } else {
            this.dateOrigin = this.store.selectSnapshot(DataQueries.getById('DatePost', this.dateOrigin.id))!
            supervisions = this.store.selectSnapshot(DataQueries.getMany('Supervision', this.dateOrigin.supervisions))!
            this.closeSwipe.next(supervisions)
          }
          this.autosize(input)
          this.sendButtonShow = !!input.value.length
          this.supervisions = supervisions
          this.cd.markForCheck()

        })
      } catch {
        // this.getUserDataService.emitDataChangeEvent()
      }
    }
    this.cd.markForCheck()
  }
  textareaSubmit(e: any, input: HTMLFormElement, comment: HTMLTextAreaElement){
    this.autosize(comment)
    this.sendButtonShow = !!comment.value.length
    // if(e.keyCode == 13){
    //   input.dispatchEvent(new Event("submit", {cancelable: true}))
    //   e.preventDefault(); // Prevents the addition of a new line in the text field (not needed in a lot of cases)
    // }
  }
  
  mainComment(task: PostDetailGraphic | null, formGroup: FormGroup, formControlName: string) {
    
  }
  
  // currentSupervisionId: Ref<Supervision> | null = null
  cameraSwipe(){
    // this.currentSupervisionId = supervsionId;
    this.swipeMenuImage = true; 
    this.cd.markForCheck()
  }

  async takePhoto() {
    const photo = await Camera.getPhoto({
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });
    // this.store.dispatch(new UploadImageSupervision(photo, this.currentSupervisionId)).pipe(take(1)).subscribe(() => {
      // this.date.supervisions
      // this.updatePageOnlyDate();
    //   this.swipeMenuImage = false;
    // });
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

    let acceptedFormat = ["jpeg", "png", "jpg", "bmp"];
    // if (acceptedFormat.includes(photo.format)) {
    //   this.store.dispatch(new UploadImageSupervision(photo, this.currentSupervisionId)).pipe(take(1)).subscribe(() => {
    //     // let supervisions = this.store.selectSnapshot(DataQueries.getMany('Supervision', this.mission!.supervisions))
    //     // this.updatePageOnlyDate();
    //     this.swipeMenuImage = false;
    //   });
    // } else {
    //   // this.updatePageOnlyDate();
    //   this.swipeMenuImage = false;
    //   this.info.show("error", "Format d'image non supporté", 3000);
    // }
  }

  autosize(input: HTMLTextAreaElement){
    setTimeout(function(){
      input.style.cssText = 'height:auto; padding:0';
      // for box-sizing other than "content-box" use:
      // el.style.cssText = '-moz-box-sizing:content-box';
      input.style.cssText = 'height:' + input.scrollHeight + 'px;';
    },0);
  }
}