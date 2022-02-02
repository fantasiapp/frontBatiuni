import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { take } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { Login } from "src/models/auth/auth.actions";
import { Email } from "src/validators/persist";
import { ComplexPassword, setErrors } from "src/validators/verify";

@Component({
  selector: 'connexion-form',
  template: `
  <!-- Form -->
  <form class="full-height form-control curved-border" [formGroup]="loginForm" (ngSubmit)="onSubmit($event)">
  <!-- Main title ex: Je me connecte, Créer un compte  -->
    <h3 class="form-title">Je me connecte</h3>
    <div class="form-input">
        <label >Adresse e-mail contact</label>
        <input class="form-element" type="email" formControlName="email"/>
        <div *ngIf="loginForm.get('email')!.errors?.email" class="error">Format invalide.</div>
        <div *ngIf="loginForm.get('email')!.errors?.server" class="server-error">
          {{ loginForm.get('email')!.errors?.server }}
        </div>
    </div>
    <div class="form-input">
        <label >Mot de passe</label>
        <input type="password" class="form-element" formControlName="password"/>
        <!-- <div *ngIf="loginForm.get('password')!.touched && loginForm.get('password')!.errors?.minlength" class="error">Doit contenir au moins 8 caractères</div> -->
        <!-- <div *ngIf="loginForm.get('password')!.touched && loginForm.get('password')!.errors?.uppercase" class="error">Doit contenir au moins une lettre en majuscule</div> -->
        <!-- <div *ngIf="loginForm.get('password')!.touched && loginForm.get('password')!.errors?.lowercase" class="error">Doit contenir au moins une lettre en miniscule</div> -->
    </div>
    <a class="external-links form-links block text-right" [routerLink]="['', 'forget_password']">
      Mot de passe oublié !
    </a>
    <div class="form-action" style="margin-top: auto;">
      <div *ngIf="loginForm.errors?.server" class="server-error">
        {{ loginForm.errors?.server }}
      </div>
      <button class="button discover gradient" style="width: 250px;" [disabled]="!loginForm.touched || loginForm.status === 'INVALID'">Se connecter</button>
    </div>
    <a class="external-links form-links block center-text" [routerLink]="['', 'register']">
      Je crée un compte !
    </a>
  </form>
  `,
  styles: [`

  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnexionForm extends Destroy$ {
  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      // Email()
    ]),
    password: new FormControl('', [
      Validators.required,
      // ComplexPassword()
    ])
  }, {});

  private _errors: string[] = [];
  get errors() { return this._errors; }

  constructor(private router: Router, private store: Store, private cd: ChangeDetectorRef) {
    super();
  }

  async onSubmit(e: any) {
    let { email, password } = this.loginForm.value;
    this.store.dispatch(new Login(email, password))
    .pipe(take(1)).subscribe(
      async (success) => {
        const result = await this.router.navigate(['', 'home']);
        if ( !result ) {
          setErrors(this.loginForm, {all: 'Erreur inattendue. (500 ?)'});
          this.cd.markForCheck();
        }
      },
      errors => {
        setErrors(this.loginForm, errors);
        this.cd.markForCheck();
      }
    );
  }
};