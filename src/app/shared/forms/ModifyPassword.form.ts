import { ChangeDetectionStrategy, Component, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ComplexPassword, MatchField } from "src/validators/verify";
import * as UserActions from "src/models/user/user.actions";
import { Store } from "@ngxs/store";
import { catchError } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";


@Component({
  selector: 'modify-password-form',
  template: `
  <form class="form-control" style="height: 100%;" [formGroup]="modifyPwdForm" >
    <div class="form-input">
      <label>Ancien mot de passe</label>
      <input class="form-element" type="password" formControlName="oldPwd"/>
      <div class="server-error" *ngIf="modifyPwdForm.get('oldPwd')!.errors">
        {{ modifyPwdForm.get('oldPwd')!.errors?.server }}
      </div>
    </div>
    <div class="form-input">
      <label>Nouveau mot de passe</label>
      <input class="form-element" type="password" formControlName="newPwd"/>
      <div *ngIf="modifyPwdForm.get('newPwd')!.touched  && modifyPwdForm.get('newPwd')!.errors?.minlength" class="error">
        Le mot de passe doit contenir au moins 8 caractères.
      </div>
      <div *ngIf="modifyPwdForm.get('newPwd')!.touched  && modifyPwdForm.get('newPwd')!.errors?.lowercase" class="error">
        Le mot de passe doit contenir une lettre en miniscule.
      </div>
      <div *ngIf="modifyPwdForm.get('newPwd')!.touched && modifyPwdForm.get('newPwd')!.errors?.uppercase" class="error">
        Le mot de passe doit contenir une lettre en majuscule.
      </div>
    </div>
    <div class="form-input">
      <label>Confirmation nouveau mot de passe</label>
      <input class="form-element" type="password" formControlName="newPwdConfirmation"/>
      <div *ngIf="modifyPwdForm.get('newPwdConfirmation')!.touched && modifyPwdForm.get('newPwdConfirmation')!.errors" class="error">
        Les mots de passes ne sont pas identiques.
      </div>
    </div>
    <button class="button gradient full-width" style="margin-top: auto;margin-bottom:10px;" [attr.disabled]="(!modifyPwdForm.touched || modifyPwdForm.invalid) || null" (click)="onSubmit()">
      Enregistrer
    </button>
  </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModifyPasswordForm {
  constructor(private store: Store) {}

  // Modify password 
  modifyPwdForm = new FormGroup({
    oldPwd: new FormControl('', [
      ComplexPassword()
    ]),
    newPwd: new FormControl('',[
      ComplexPassword()     
    ]),
    newPwdConfirmation: new FormControl('',[
      MatchField('newPwd')
    ])
  }, {})

  onSubmit() {
    let { oldPwd, newPwd } = this.modifyPwdForm.value;
    let req = this.store.dispatch(new UserActions.ChangePassword(oldPwd, newPwd));
    req.pipe(
      catchError((err: HttpErrorResponse) => {
        return throwError(err);
      })
    ).subscribe(console.info);
  }
};