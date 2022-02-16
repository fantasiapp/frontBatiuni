import { Component, ChangeDetectorRef} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ChangeDetectionStrategy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { ForgotPassword } from "src/models/auth/auth.actions";
import { take } from "rxjs/operators";
import { ComplexPassword, MatchField, setErrors } from "src/validators/verify";


@Component({
  selector: 'forgot-password-form',
  template: `
    <!-- Form -->
    <form class="full-height form-control curved-border" [formGroup]="forgotPassword" (ngSubmit)="onSubmit($event)">
    <!-- Main title ex: Je me connecte, Créer un compte  -->
      <h3 class="form-title">Modifier le mot de passe</h3>
      <div class="form-input">
          <label >Nouveau mot de passe</label>
          <input class="form-element" type="password" formControlName="password"/>
          <div *ngIf="forgotPassword.get('password')!.touched && forgotPassword.get('password')!.errors?.minlength" class="error">Doit contenir au moins 8 caractères</div>
          <div *ngIf="forgotPassword.get('password')!.touched && forgotPassword.get('password')!.errors?.uppercase" class="error">Doit contenir au moins une lettre en majuscule</div>
          <div *ngIf="forgotPassword.get('password')!.touched && forgotPassword.get('password')!.errors?.lowercase" class="error">Doit contenir au moins une lettre en miniscule</div>          
      </div>
      <div class="form-input">
          <label >Confirmation de mot de passe</label>
          <input type="password" class="form-element" formControlName="confirmedPassword"/>
          <div *ngIf="forgotPassword.get('confirmedPassword')!.touched && forgotPassword.get('confirmedPassword')!.errors?.minlength" class="error">Doit contenir au moins 8 caractères</div>
          <div *ngIf="forgotPassword.get('confirmedPassword')!.touched && forgotPassword.get('confirmedPassword')!.errors?.uppercase" class="error">Doit contenir au moins une lettre en majuscule</div>
          <div *ngIf="forgotPassword.get('confirmedPassword')!.touched && forgotPassword.get('confirmedPassword')!.errors?.lowercase" class="error">Doit contenir au moins une lettre en miniscule</div>
      </div>
      
      <div class="form-action">
        
        <button class="button discover gradient" style="width: 250px;" [disabled]="!forgotPassword.touched || forgotPassword.status === 'INVALID'">Valider</button>
      </div>
     
    </form>`,
  styles: [`
    @import 'src/styles/mixins';

  `],
  changeDetection: ChangeDetectionStrategy.OnPush

})

export class ForgotPasswordForm {

  constructor(private route: ActivatedRoute, private router: Router,private cd: ChangeDetectorRef, private store: Store) { }
  token: any;

  forgotPassword = new FormGroup({
    password: new FormControl('',
      [ComplexPassword()]),
    confirmedPassword: new FormControl('',
      [MatchField('password', 'Le mot de passe')]
    )
  })
  ngOnInit() {
    this.token = this.route.snapshot.params.token;
  }
  async onSubmit(e: any) {
    let { password } = this.forgotPassword.value;
    this.store.dispatch(new ForgotPassword(this.token, password))
    .pipe(take(1)).subscribe(
      async (success) => {
          let res = await this.router.navigate(['','connexion'])
          if ( !res ) {
            setErrors(this.forgotPassword, {all: 'Erreur inattendue. (500 ?)'});
            this.cd.markForCheck();
          }
      },
      errors => {
        setErrors(this.forgotPassword, errors);
        this.cd.markForCheck();
      }
    )
  }
}