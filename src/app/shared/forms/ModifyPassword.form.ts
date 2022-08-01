import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { take } from "rxjs/operators";
import { ComplexPassword, MatchField } from "src/validators/verify";
import { returnInputKeyboard } from '../common/classes'
import { Mobile } from "../services/mobile-footer.service";

@Component({
  selector: 'modify-password-form',
  template: `
  <form class="form-control" style="height: 100%;" [formGroup]="form" id="form" >
    <div class="form-input">
      <label>Ancien mot de passe</label>
      <div class="form-input flex">
      <input class="form-element" type="password" formControlName="oldPwd" id="idPassword" (keyup)="returnInputKeyboard($event, input1)" (click)="onClickInputScroll(input1)" #input1/>
      <div (click)="togglePassword()" style="position: absolute; cursor: pointer; top: 0; right: 0; z=100">
        <img class="eye" src="assets/Oeil_ferme.svg" id="togglePassword">
      </div>
      </div>
    </div>
    <div class="form-input">
      <label>Nouveau mot de passe</label>
      <div class="form-input flex">
      <input class="form-element" type="password" formControlName="newPwd" id="idPassword" (keyup)="returnInputKeyboard($event, input2)" (click)="onClickInputScroll(input2)" #input2/>
      <div (click)="togglePassword()" style="position: absolute; cursor: pointer; top: 0; right: 0; z=100">
        <img class="eye" src="assets/Oeil_ferme.svg" id="togglePassword">
      </div>
      </div>
    </div>
    <div class="form-input">
      <label>Confirmation nouveau mot de passe</label>
      <div class="form-input flex">
      <input class="form-element" type="password" formControlName="newPwdConfirmation" id="idPassword" (click)="onClickInputScroll(input3)" (keyup)="returnInputKeyboard($event, input3)" #input3/>
      <div (click)="togglePassword()" style="position: absolute; cursor: pointer; top: 0; right: 0; z=100">
        <img class="eye" src="assets/Oeil_ferme.svg" id="togglePassword">
      </div>
    </div>
    </div>
  </form>

  <div class="sticky-footer" *ngIf="showFooter">
    <button class="button gradient full-width" (click)="onSubmit()" [disabled]="form.invalid || null || disableBoutton">Enregistrer </button>
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

    img {
        width: 75%;
        height: auto;
      }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModifyPasswordForm {

  returnInputKeyboard = returnInputKeyboard
  constructor(private cd: ChangeDetectorRef, private mobile:Mobile) {}

  @Output() submit = new EventEmitter<FormGroup>();

  disableBoutton = false;

  // Modify password 
  form = new FormGroup({
    oldPwd: new FormControl('', []),
    newPwd: new FormControl('',[
      ComplexPassword()     
    ]),
    newPwdConfirmation: new FormControl('',[
      MatchField('newPwd')
    ])
  }, {})

  showFooter: boolean = false

  ngOnInit(){
    this.mobile.footerStateSubject.subscribe(b=>{
      this.showFooter = b;
      this.cd.detectChanges()
    })
  }

  onSubmit() { 
    this.submit.emit(this.form);
    this.disableBoutton = true;
    this.form.reset()
    document.querySelector("form")?.reset();
    if (this.form.get('oldPwd')?.value == null){this.disableBoutton=false;}
    this.cd.markForCheck()
      
  }

  togglePassword() {
    const togglePassword = document.querySelectorAll('#togglePassword');
    const password = document.querySelectorAll('#idPassword');
    let type = password.item(0).getAttribute('type') === 'password' ? 'text' : 'password'
    let toggleClass = password.item(0).getAttribute('type') === 'password' ? 'assets/Oeil_ouvert.svg' : 'assets/Oeil_ferme.svg'
    password.forEach((pwd) => {
      pwd.setAttribute('type', type)
    })
    togglePassword.forEach((togglepwd) => {
      togglepwd.setAttribute('src', toggleClass)
    })
  }

  onClickInputScroll(input: HTMLElement){
    setTimeout(() => {
      input.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'})
      setTimeout(() => {
        input.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'})
      }, 500)
    }, 100)
  }
};