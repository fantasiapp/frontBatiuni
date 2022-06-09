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
  hasNewResponse: boolean = false;
  registerForm: FormGroup | undefined;

  constructor(private store: Store) {}

  emitDataChangeEvent() {
    if(this.hasNewResponse) {
      this.navchange.emit(this.response);
      this.hasNewResponse = false
    }
  }

  setNewResponse(response: any) {
    this.hasNewResponse = true
    this.response = response
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
