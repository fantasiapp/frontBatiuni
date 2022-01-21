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
import { JobRow, RoleRow } from "src/models/data/data.model";
import { Subject } from "rxjs";
import { GetCompanies } from "src/models/misc/misc.actions";



@Component({
  selector: 'register-form',
  template: `
    <div class="content" type="template" [slides]="[page1, page2]"></div>
    <ng-template #page1>
      <div class="full-width flex column grow">
        <form class="grow form-control curved-border" [formGroup]="registerForm">
          <h3 class="form-title">Créer un compte !</h3>
          <h4 class="form-subtitle">Informations contact</h4>
          <div class="form-input">
            <label>Nom du contact</label> <input type="text" formControlName="lastname"/>
          </div>
        
          <div class="form-input">
            <label>Prénom du contact</label> <input type="text" formControlName="firstname"/>
          </div>
        
          <div class="form-input">
            <label>Adresse e-mail contact</label>
            <input type="email" formControlName="email"/>
            <div *ngIf="registerForm.get('email')!.dirty && registerForm.get('email')!.errors" class="server-error">
              {{ registerForm.get('email')!.errors?.server }}
            </div>
          </div>
        
          <div class="form-input">
            <label>Vérification addresse e-mail</label>
            <input type="email" formControlName="emailVerification"/>
            <div *ngIf="registerForm.get('password')!.dirty  && registerForm.get('emailVerification')!.errors?.mismatch" class="error">
              L'e-mail de confirmation doit être identique à celui du contact.
            </div>
          </div>
        
          <div class="form-input">
            <label>Mot de passe</label> <input type="password" formControlName="password"/>
            <div *ngIf="registerForm.get('password')!.dirty  && registerForm.get('password')!.errors?.minlength" class="error">
              Le mot de passe doit contenir au moins 8 caractères.
            </div>
            <div *ngIf="registerForm.get('password')!.dirty  && registerForm.get('password')!.errors?.lowercase" class="error">
              Le mot de passe doit contenir une lettre en miniscule.
            </div>
            <div *ngIf="registerForm.get('password')!.dirty && registerForm.get('password')!.errors?.uppercase" class="error">
              Le mot de passe doit contenir une lettre en majuscule.
            </div>
          </div>
          <div *ngIf="showSteps" class="form-step">
            <div class="active"></div>
            <div (click)="slider.left()"></div>
          </div>
        </form>
      </div>
    </ng-template>
    
    <ng-template #page2>
      <div class="full-width flex column grow">
        <form class="grow form-control curved-border" [formGroup]="registerForm" (ngSubmit)="onSubmit($event)">
        <h3 class="form-title">Créer un compte !</h3>
        <h4 class="form-subtitle">Informations contact</h4>
          <div class="form-input">
            <label>Je suis</label>
            <options formControlName="role" [options]="roles" type="radio" [searchable]="false">
            </options>
          </div>
      
          <div class="form-input">
            <label>Nom de l'entreprise</label>
            <input type="text" formControlName="company" (input)="onCompanySearch($event)"/>
            <suggestion-box [query]="searchQuery | async" [action]="actions.GetCompanies" (choice)="onChoice($event)"></suggestion-box>
          </div>
        
          <div class="form-input">
            <label>Métier</label>
            <options [options]="jobs" formControlName="jobs"></options>
          </div>

          <div class="form-input parrain">
            <label>Code parrain ?</label>
            <input type="password" formControlName="proposer"/>
          </div>

          <div class="form-action" style="margin-top: auto;">
            <div *ngIf="registerForm.errors?.server" class="server-error">
              {{ registerForm.errors?.server }}
            </div>
            <button *ngIf="showSubmitButton" class="button discover gradient" style="width: 250px" [disabled]="!registerForm.valid">Valider</button>
          </div>
        
          <div *ngIf="showSteps" class="form-step">
            <div (click)="slider.right()"></div>
            <div class="active"></div>
          </div>
        </form>
      </div>
    </ng-template>
  `,
  styles: [`
    @import 'src/styles/mixins';
    
    :host(.mobile-view) {
      @extend %content-with-paging-and-big-footer;
    }

    .parrain {
      align-self: flex-end;
      max-width: 50vw;
    }

    .suggestion-list {
      position: absolute;
      z-index: 10;
      max-height: 100px;
      overflow: hidden auto;
      background: white;
      box-shadow: 0 4px 4px 0 #ccc;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterForm {
  @HostBinding('class')
  get classes() {
    const isMobile = window.innerWidth <= 768;
    return 'hosted-page flex column' + (isMobile ? ' mobile-view' : '');
  }

  constructor(private store: Store, private router: Router, private cd: ChangeDetectorRef) {}

  @ViewChild(SlidesDirective, {static: true})
  slider!: SlidesDirective;

  @Input()
  showSteps: boolean = true;

  @Input()
  showSubmitButton: boolean = true;

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
    role: new FormControl([], [Validators.required]),
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
          console.log(this.registerForm.errors);
          this.cd.markForCheck();
        }
      );
  }

  onNavigate(dx: number, done?: Function) {
    if ( dx > 0 ) this.slider.left();
    else this.slider.right();
  }

  searchQuery = new Subject<string>();

  /* input behaviour */
  /* group this to suggestion box in the end */
  private lastEmit: number | null = null;
  private lastLength: number = 0;
  private timeout: any = null;

  onCompanySearch(e: Event) {
    const value = (e.target as HTMLInputElement).value,
      diff = value.length - this.lastLength,
      now = +(new Date);

    
    //for future completion
    if ( this.timeout ) {clearTimeout(this.timeout);}
    this.timeout = setTimeout(() => {
      this.searchQuery.next(value);
      this.lastEmit = null;
      this.lastLength = value.length;
    }, 1000);
    
    if ( diff >= 4 || (this.lastEmit && (now - this.lastEmit > 4000))) {
      this.searchQuery.next(value);
      this.lastEmit = now;
      this.lastLength = value.length;
    }
  }

  actions = {GetCompanies};

  onChoice(name: string) {
    this.registerForm.get('company')?.setValue(name);
  }

  jobs: Option[] = [...JobRow.instances.values()].map(job => ({...job, checked: false}));
  roles = [...RoleRow.instances.values()].map(role => ({id: role.id, name: role.name, checked: false}));
};