import { EventEmitter, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MyStore } from "src/app/shared/common/classes";
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

  constructor(private store: MyStore) {}

  emitDataChangeEvent(timestamp?: number) {
    if (timestamp){
      this.lastTimeStamp = timestamp
    }
    if(this.hasNewResponse) { //  && this.lastTimeStamp < this.getUserDataTimeStamp
      this.navchange.emit(this.response);
      this.hasNewResponse = false
    }
  }

  setNewResponse(response: any) {
    this.getUserDataTimeStamp = response.timestamp
    this.hasNewResponse = true
    this.response = response
  }

  setGetUserDataTimeStamp(timestamp : number){
    this.getUserDataTimeStamp = timestamp
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

  resetTimestamp() {
    this.getUserDataTimeStamp = 0
    this.lastTimeStamp = 0
  }

}
