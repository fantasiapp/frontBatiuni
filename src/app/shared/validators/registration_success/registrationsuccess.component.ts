import {  ChangeDetectionStrategy, ChangeDetectorRef, Component,} from "@angular/core";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { AppState } from "src/app/app.state";
import { AuthState } from "src/models/auth/auth.state";

@Component({
  selector: 'success',
  templateUrl: 'registrationsuccess.component.html',
  styleUrls: ['registrationsuccess.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrationSuccess {
  userEmail : string;

  constructor(private store: Store) {
    const auth = this.store.selectSnapshot(AuthState);
    this.userEmail = auth.pendingEmail; //must delete later
  }
};