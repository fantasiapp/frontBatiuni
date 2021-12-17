import {  ChangeDetectionStrategy, Component,} from "@angular/core";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
@Component({
  selector: 'emailConfirmed',
  templateUrl: 'registrationsuccess.component.html',
  styleUrls: ['registrationsuccess.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrationSuccess {
  userEmail : string;
  constructor(private router:Router){
    this.userEmail = "Jean-luc@fantasiapp.com"
  }
  
};