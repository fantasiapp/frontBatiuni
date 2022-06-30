import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'task-add',
  templateUrl: './task-add.component.html',
  styleUrls: ['./task-add.component.scss']
})
export class TaskAddComponent implements OnInit {

  newTasks: string[] = []
  newTaskForm = new FormGroup({
    task: new FormControl("", [Validators.required]),
  });

  constructor() { }

  ngOnInit(): void {
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
