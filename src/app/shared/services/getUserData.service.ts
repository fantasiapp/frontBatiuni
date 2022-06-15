import { EventEmitter, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngxs/store';
import { RegisterForm } from '../forms/register.form';

@Injectable({
  providedIn: 'root'
})


export class getUserDataService {
  navchange: EventEmitter<boolean> = new EventEmitter();

  response: any;
  lastTimeStamp: number= 0;
  getUserDataTimeStamp: number= 0;
  hasNewResponse: boolean = false;
  registerForm: FormGroup | undefined;

  constructor(private store: Store) {}

  emitDataChangeEvent(timeStamp?: number) {
    if (timeStamp){
      this.lastTimeStamp = timeStamp
    }
    if(this.hasNewResponse && this.lastTimeStamp < this.getUserDataTimeStamp) {
      this.navchange.emit(this.response);
      this.hasNewResponse = false
    }
  }

  setNewResponse(response: any) {
    this.hasNewResponse = true
    this.response = response
  }

  setGetUserDataTimeStamp(timeStamp : number){
    this.getUserDataTimeStamp = timeStamp
  }

  getDataChangeEmitter() {
    return this.navchange;
  }

  setRegisterForm(registerForm: FormGroup) {
    this.registerForm = registerForm
  }

  getRegisterForm() {
    return this.registerForm
  }

}
