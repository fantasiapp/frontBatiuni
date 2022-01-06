import {  ChangeDetectionStrategy, ChangeDetectorRef, Component,} from "@angular/core";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { AppState } from "src/app/app.state";

@Component({
  selector: 'emailConfirmed',
  templateUrl: 'registrationsuccess.component.html',
  styleUrls: ['registrationsuccess.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrationSuccess {
  userEmail : string;

  constructor() {
    this.userEmail = "Jean-luc@fantasiapp.com"
  }
};