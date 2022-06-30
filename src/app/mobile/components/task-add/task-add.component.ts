import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Destroy$ } from 'src/app/shared/common/classes';
import { Mobile } from 'src/app/shared/services/mobile-footer.service';

@Component({
  selector: 'task-add',
  templateUrl: './task-add.component.html',
  styleUrls: ['./task-add.component.scss']
})
export class TaskAddComponent extends Destroy$ {

  newTasks: string[] = []
  newTaskForm = new FormGroup({
    task: new FormControl("", [Validators.required]),
  });


  platform: string = ''
  showFooter: boolean = true;


  constructor(private mobile: Mobile, private cd: ChangeDetectorRef) {
    super()
  }

  ngOnInit(): void {
    this.mobile.init()
    this.mobile.footerStateSubject.pipe(takeUntil(this.destroy$)).subscribe(b => {
      this.showFooter = b
      this.cd.detectChanges()
    })
    this.platform = this.mobile.plateform
  }

  ngOnDestroy() {
    super.ngOnDestroy()
  }

  @Output() validateEmiter = new EventEmitter()

  submit(e:Event, form: HTMLFormElement){
    e.preventDefault()
    form.dispatchEvent(new Event("submit", {cancelable: true}))
  }

  addNewTask(e: Event, form: FormGroup){
    let formControl = form.get('task')!
    let value = formControl.value
    if(!value || value.trim() == '') return

    this.newTasks.push(value)
    formControl.reset()
  }

  validate(){
    console.log('this.bewTasks' , this.newTasks);
    this.validateEmiter.next(this.newTasks)
  }
}
