import {  ChangeDetectionStrategy, Component,} from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: 'emailConfirmed',
  templateUrl: 'registrationsuccess.component.html',
  styleUrls: ['registrationsuccess.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrationSuccess {
  userEmail : string;
  constructor(){
    this.userEmail = "Jean-luc@fantasiapp.com"
  }
  
};