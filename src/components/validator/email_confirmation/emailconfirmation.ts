import {  Component,} from "@angular/core";
import { Router } from "@angular/router";
@Component({
  selector: 'emailConfirmed',
  templateUrl: 'emailconfirmation.component.html',
  styleUrls: ['emailconfirmed.scss'],
})
export class emailConfirmation {
  constructor(private router:Router){}
  // On click redirect user to login page
  redirect() {
    this.router.navigate(['connexion']);
  }
};