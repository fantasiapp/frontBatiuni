import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { take } from "rxjs/operators";
import { Register } from "src/models/auth/auth.actions";
import { ComplexPassword, MatchField, setErrors } from "src/validators/verify";
import { SlidesDirective } from "../directives/slides.directive";
import { Option } from "src/models/option";
import { Email } from "src/validators/persist";
import { Job, Role } from "src/models/data/data.model";


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
            <label>Adresse e-mail contact</label>
            <input type="email" formControlName="email"/>
            <div *ngIf="registerForm.get('email')!.touched && registerForm.get('email')!.errors" class="server-error">
              {{ registerForm.get('email')!.errors?.server }}
            </div>
          </div>
        
          <div class="form-input">
            <label>Vérification addresse e-mail</label>
            <input type="email" formControlName="emailVerification"/>
          </div>
        
          <div class="form-input">
            <label>Mot de passe</label> <input type="password" formControlName="password"/>
            <div *ngIf="registerForm.get('password')!.touched  && registerForm.get('password')!.errors?.minlength" class="error">
              Le mot de passe doit contenir au moins 8 caractères.
            </div>
            <div *ngIf="registerForm.get('password')!.touched  && registerForm.get('password')!.errors?.lowercase" class="error">
              Le mot de passe doit contenir une lettre en miniscule.
            </div>
            <div *ngIf="registerForm.get('password')!.touched && registerForm.get('password')!.errors?.uppercase" class="error">
              Le mot de passe doit contenir une lettre en majuscule.
            </div>
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
              <option *ngFor="let role of roles" [value]="role.value">{{role.name}}</option>
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
            <div *ngIf="registerForm.errors?.server" class="server-error">
              {{ registerForm.errors?.server }}
            </div>
            <button class="button discover gradient" style="width: 250px" [disabled]="!registerForm.touched || registerForm.status === 'INVALID'">Valider</button>
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
  
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterForm {
  @HostBinding('class')
  get classes() {
    return 'hosted-page flex column' + (this.pagingContent ? ' paging-only-content' : '');
  }

  constructor(private store: Store, private router: Router, private cd: ChangeDetectorRef) {}

  @ViewChild(SlidesDirective, {static: true})
  slider!: SlidesDirective;

  ngOnInit() {
    (window as any).register = this;
  }

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
      Email()
    ]),
    emailVerification: new FormControl('', [
      Validators.required
    ]),
    password: new FormControl('', [
      Validators.minLength(8)
    ]),
    proposer: new FormControl(''),
    role: new FormControl('', [Validators.required]),
    company: new FormControl('', [Validators.required]),
    jobs: new FormControl([], [Validators.required])
  }, {validators: [MatchField('email', 'emailVerification'), ComplexPassword('password')]});

  onSubmit(f: any) {
    console.log(this.registerForm.value);
    this.store.dispatch(Register.fromFormGroup(this.registerForm))
      .pipe(take(1))
      .subscribe(
        success => this.router.navigate(['', 'success']),
        errors => {
          if ( !errors.all ) this.onNavigate(-1)
          setErrors(this.registerForm, errors);
        }
      );
  }

  onNavigate(dx: number, done?: Function) {
    if ( dx > 0 ) this.slider.left();
    else this.slider.right();
  }

  jobs: Option[] = [...Job.instances.values()].map(job => ({...job, checked: false}));
  roles = [...Role.instances.values()].map(role => ({value: role.id, name: role.name}));
};