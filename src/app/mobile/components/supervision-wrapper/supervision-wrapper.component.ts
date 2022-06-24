import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { take } from 'rxjs/operators';
import { Mobile } from 'src/app/shared/services/mobile-footer.service';
import { DatePost, Mission, PostDetail, PostDetailGraphic, Supervision } from 'src/models/new/data.interfaces';
import { DataQueries } from 'src/models/new/data.state';
import { CreateSupervision } from 'src/models/new/user/user.actions';
import { TaskGraphic } from '../suivi_chantier_date-content/suivi_chantier_date-content.component';

@Component({
  selector: 'app-supervision-wrapper',
  templateUrl: './supervision-wrapper.component.html',
  styleUrls: ['./supervision-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Mobile]
})
export class SupervisionWrapperComponent implements OnInit {

  @Input() taskGraphic: TaskGraphic | null = null
  @Input() mission!: Mission
  @Input() dateOrigin!: DatePost
  // @Input() formControlName!: string
  @Input() selectedTask: PostDetailGraphic | null = null
  @Input() supervisions: Supervision[] = []
  showFooter: boolean = true;


  constructor(public mobile: Mobile, private cd: ChangeDetectorRef, private store: Store) {

    console.log('object', this.taskGraphic, this.mission,this.dateOrigin, this.selectedTask);
  }
  
  ngOnInit(): void {
    console.log('object', this.taskGraphic, this.mission,this.dateOrigin, this.selectedTask);
    this.mobile.init()
    this.mobile.footerStateSubject.subscribe(b => {
      console.log('fasdf', b);
      this.showFooter = b
      this.cd.detectChanges()
    })
  }

  formMain = new FormGroup({
    inputComment: new FormControl("", [Validators.required]),
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
    if(!comment || comment.trim() == '') return
    if (!this.mission!.isClosed) {
      let detailPostId: number | null = task ? task.id : null
      let datePostId: number | null = null;
      if (!detailPostId) {
        datePostId = this.dateOrigin.id
      }
      // try {
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
          }
          console.log('response');

          this.cd.markForCheck()

          // this.updatePageOnlyDate()
        })
      // } catch {
      //   this.getUserDataService.emitDataChangeEvent()
      // }
    }
  }



}
