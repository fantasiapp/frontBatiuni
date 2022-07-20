import {  ChangeDetectionStrategy, ChangeDetectorRef, Component, Input,} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { MyStore } from "src/app/shared/common/classes";
import { take } from "rxjs/operators";
import { AppState } from "src/app/app.state";
import { Register } from "src/models/auth/auth.actions";
import { AuthState } from "src/models/auth/auth.state";
import { setErrors } from "src/validators/verify";
import { RegisterForm } from "../../forms/register.form";
import { getUserDataService } from "../../services/getUserData.service";

@Component({
  selector: 'success',
  templateUrl: 'registrationsuccess.component.html',
  styleUrls: ['registrationsuccess.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrationSuccess {
  userEmail : string;

  registerForm: FormGroup;

  constructor(private store: MyStore,private cd: ChangeDetectorRef, private getUserDataService: getUserDataService) {
    const auth = this.store.selectSnapshot(AuthState);
    this.userEmail = auth.pendingEmail; //must delete later
    this.registerForm = this.getUserDataService.getRegisterForm()!
  }

  onSubmit(f: any) {
      this.store
        .dispatch(Register.fromFormGroup(this.registerForm!, true))
        .pipe(take(1))
        .subscribe(
          (success) => {

          },
          (errors) => {
            if (errors.email) {
              errors.all = errors.all
                ? errors.all + "\n" + errors.email
                : errors.email;
            }
            setErrors(this.registerForm!, errors);
            this.cd.markForCheck();
          }
        );
  }
  
};