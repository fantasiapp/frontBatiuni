import { ChangeDetectionStrategy, Component, EventEmitter, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ComplexPassword, MatchField } from "src/validators/verify";
import { returnInputKeyboard } from '../common/classes'

@Component({
  selector: 'modify-password-form',
  template: `
  <form class="form-control" style="height: 100%;" [formGroup]="form" >
    <div class="form-input">
      <label>Ancien mot de passe</label>
      <input class="form-element" type="password" (keyup)="returnInputKeyboard($event, input1)" formControlName="oldPwd" #input1/>
    </div>
    <div class="form-input">
      <label>Nouveau mot de passe</label>
      <input class="form-element" type="password" (keyup)="returnInputKeyboard($event, input1)" formControlName="newPwd" #input2/>
    </div>
    <div class="form-input">
      <label>Confirmation nouveau mot de passe</label>
      <input class="form-element" type="password" (keyup)="returnInputKeyboard($event, input1)" formControlName="newPwdConfirmation" #input3/>
    </div>
  </form>

  <div class="sticky-footer">
    <button class="button gradient full-width" (click)="onSubmit()"
      [disabled]="form.invalid || null">
      Enregistrer
    </button>
  </div>
  `,
  styles: [`
    @use 'src/styles/variables' as *;
    @use 'src/styles/mixins' as *;
    @use 'src/styles/forms' as *;

    :host { width: 100%;
     }

    .sticky-footer {
      box-shadow: 0 -3px 3px 0 #ddd;
      background-color: white;
      @extend %sticky-footer;
    }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModifyPasswordForm {

  returnInputKeyboard = returnInputKeyboard
  constructor() {}

  @Output() submit = new EventEmitter<FormGroup>();

  // Modify password 
  form = new FormGroup({
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

  onSubmit() { this.submit.emit(this.form); }
};