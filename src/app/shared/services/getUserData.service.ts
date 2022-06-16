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

  emitDataChangeEvent(timestamp?: number) {
    if (timestamp){
      this.lastTimeStamp = timestamp
    }
    console.log("les times stamp, lastTimeStamp :", this.lastTimeStamp, "l'autre qui doit être plus petit", this.getUserDataTimeStamp)
    if(this.hasNewResponse && this.lastTimeStamp < this.getUserDataTimeStamp) {
      console.log("update data daaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaans le service")
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
