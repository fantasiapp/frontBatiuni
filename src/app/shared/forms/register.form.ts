import { Component, HostBinding, Input, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { Register } from "src/models/auth/auth.actions";
import { MatchField } from "src/validators/verify";
import { SlidesDirective } from "../directives/slides.directive";

@Component({
  selector: 'register-form',
  template: `
    <div class="content" type="template" [slides]="[page1, page2]"></div>
    <ng-template #page1>
      <div class="full-width flex column grow">
        <form class="grow form-control curved-border" [formGroup]="registerForm">
          <h4 class="form-title font-Roboto center-text">Créer un compte !</h4>
          <h3 class="form-subtitle">Informations contact</h3>
          <div class="form-input">
            <label>Nom du contact</label> <input type="text" formControlName="lastname"/>
          </div>
        
          <div class="form-input">
            <label>Prénom du contact</label> <input type="text" formControlName="firstname"/>
          </div>
        
          <div class="form-input">
            <label>Adresse e-mail contact</label> <input type="email" formControlName="email"/>
          </div>
        
          <div class="form-input">
            <label>Vérification addresse e-mail</label> <input type="email" formControlName="emailVerification"/>
          </div>
        
          <div class="form-input">
            <label>Mot de passe</label> <input type="password" formControlName="password"/>
          </div>
        
          <div class="form-input">
            <label>Code parrain ?</label> <input type="password" formControlName="proposer"/>
          </div>
          <a class="external-links form-links block center-text" style="margin-top: auto;" [routerLink]="['', 'connexion']">
            J'ai déjà un compte
          </a>
          <div class="form-step">
            <div class="active"></div>
            <div (click)="slider.left()"></div>
          </div>
        </form>
      </div>
    </ng-template>
    
    <ng-template #page2>
      <div class="full-width flex column grow">
        <form class="grow form-control curved-border" [formGroup]="registerForm" (ngSubmit)="onSubmit($event)">
          <h3 class="form-title center-text">Créer un compte !</h3>
          <h3 class="form-subtitle">Informations entreprise</h3>
          <div class="form-input">
            <label>Je suis</label>
            <select formControlName="role">
              <option value="0">Une entreprise à la recherche de sous-traitances</option>
              <option value="1">Un sous-traitant à la recerche d'une entreprise</option>
              <option value="2">Les deux</option>
            </select>
          </div>
      
          <div class="form-input">
            <label>Nom de l'entreprise</label><input type="text" formControlName="company"/>
          </div>
        
          <div class="form-input">
            <label>Métier</label>
            <options [options]="jobs" formControlName="jobs"></options>
          </div>
          <div class="form-action" style="margin-top: auto;">
            <button class="button discover gradient" style="width: 250px">Valider</button>
          </div>
        
          <div class="form-step">
            <div (click)="slider.right()"></div>
            <div class="active"></div>
          </div>
        </form>
      </div>
    </ng-template>
  `,
  styles: [`
  
  `]
})
export class RegisterForm {
  @HostBinding('class')
  get classes() {
    return 'hosted-page flex column' + (this.pagingContent ? ' paging-only-content' : '');
  }

  constructor(private store: Store, private router: Router) {}

  @ViewChild(SlidesDirective, {static: true})
  slider!: SlidesDirective;


  @Input()
  pagingContent: boolean = true;

  registerForm = new FormGroup({
    lastname: new FormControl('', [
      Validators.required
    ]),
    firstname: new FormControl('', [
      Validators.required
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    emailVerification: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.minLength(8)
    ]),
    proposer: new FormControl(''),
    role: new FormControl(''),
    company: new FormControl(''),
    jobs: new FormControl([])
  }, {validators: MatchField('email', 'emailVerification')});

  onSubmit(f: any) {
    console.log(this.registerForm.value);
    this.store.dispatch(Register.fromFormGroup(this.registerForm));
    this.router.navigate(['confirmed'])
  }

  jobs = [];
};