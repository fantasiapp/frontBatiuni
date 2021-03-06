import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { take, takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { Login } from "src/models/auth/auth.actions";
import { GiveNotificationToken } from "src/models/new/user/user.actions";
import { Email } from "src/validators/persist";
import { ComplexPassword, setErrors } from "src/validators/verify";
import { BooleanService } from "../services/boolean.service";
import { LocalService } from "../services/local.service";
import { Mobile } from "../services/mobile-footer.service";
import { NotifService } from "../services/notif.service";

@Component({
  selector: 'connexion-form',
  template: `
  <!-- Form -->
  <form class="full-height form-control section-host curved-border" [formGroup]="loginForm" (ngSubmit)="onSubmit($event)">
  <!-- Main title ex: Je me connecte, Créer un compte  -->
    <section class="form-section">
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
          <input type="password" class="form-element" formControlName="password" id="idPassword">
          <div (click)="togglePassword()" style="position: absolute; cursor: pointer; bottom: 0; right: 0">
            <img class="eye" src="assets/Oeil_ferme.svg" id="togglePassword"></div>
          <!-- <div *ngIf="loginForm.get('password')!.touched && loginForm.get('password')!.errors?.minlength" class="error">Doit contenir au moins 8 caractères</div> -->
          <!-- <div *ngIf="loginForm.get('password')!.touched && loginForm.get('password')!.errors?.uppercase" class="error">Doit contenir au moins une lettre en majuscule</div> -->
          <!-- <div *ngIf="loginForm.get('password')!.touched && loginForm.get('password')!.errors?.lowercase" class="error">Doit contenir au moins une lettre en miniscule</div> -->
      </div>
      <div class="lost-password ">
      <a class="external-links form-links block " [routerLink]="['', 'mail']" style="margin-top: 1rem;" *ngIf="showFooter">
        Mot de passe oublié !
      </a>
      </div>
    </section>
    <div class="form-action" style="margin-top: auto; margin-bottom: unset">
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
    @use "/src/styles/forms.scss" as *;

    :host{
      overflow: scroll;
      padding-bottom: calc(env(safe-area-inset-bottom) + 2rem);
    }
    form {
      height: fit-content;
      min-height: 100%;
    }
    .lost-password {
      position: relative;
      width: 100%;

      a {
        position: absolute;
        right: 0;
      }
    }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnexionForm extends Destroy$ {
  loginForm = new FormGroup({
    email: new FormControl(this.lastEmail, [
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
  showFooter: boolean = true 

  constructor(private router: Router, private store: Store, private cd: ChangeDetectorRef, private isLoadingService: BooleanService, private notifService: NotifService, private mobileFooterService: Mobile, private localService: LocalService) {
    super();
  }

  ngOnInit(){
    if(this.lastEmail)
      this.loginForm.get("email")!.markAsTouched()


    this.mobileFooterService.init()
    
    this.mobileFooterService.footerStateSubject.pipe(takeUntil(this.destroy$)).subscribe((b) => {
      this.showFooter = b;
      this.cd.detectChanges()
    });
  }

  async onSubmit(e: any) {
    this.mobileFooterService.hide()
    this.isLoadingService.emitLoadingChangeEvent(true)
    let { email, password } = this.loginForm.value;
    this.store.dispatch(new Login(email, password))
    .pipe(take(1)).subscribe(
      (success) => {
        if(success){
          this.localService.setLastEmail(email)
          const result = this.router.navigate(['', 'home']);
          this.store.dispatch(new GiveNotificationToken(this.notifService.getToken()))
          // if ( !result ) {
          //   setErrors(this.loginForm, {all: 'Erreur inattendue. (500 ?)'});
          //   this.cd.markForCheck();
          // }
        }
      },
      errors => {
        this.isLoadingService.emitLoadingChangeEvent(false)
        setErrors(this.loginForm, errors);
        this.cd.markForCheck();
      }
    );
  }

  togglePassword() {
    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('#idPassword');
    let type = password?.getAttribute('type') === 'password' ? 'text' : 'password'
    let toggleClass = password?.getAttribute('type') === 'password' ? 'assets/Oeil_ouvert.svg' : 'assets/Oeil_ferme.svg'
    password?.setAttribute('type', type)
    togglePassword?.setAttribute('src', toggleClass)
  }

  hide(){
    this.mobileFooterService.hide()
  }

  get lastEmail(){
    return this.localService.getLastEmail()
  }
};