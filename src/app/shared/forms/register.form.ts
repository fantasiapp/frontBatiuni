import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import {
  bufferCount,
  debounceTime,
  last,
  map,
  take,
  takeUntil,
} from "rxjs/operators";
import { Register } from "src/models/auth/auth.actions";
import {
  ComplexPassword,
  MatchField,
  RequiredType,
  setErrors,
  TransferError,
} from "src/validators/verify";
import { SlidesDirective } from "../directives/slides.directive";
import { Email } from "src/validators/persist";
import { merge, Subject } from "rxjs";
import { UISuggestionBox } from "../components/suggestionbox/suggestionbox.component";
import { Destroy$ } from "../common/classes";
import { SnapshotAll } from "src/models/new/data.state";
import { Establishement, Job, Role } from "src/models/new/data.interfaces";
import { GetCompanies } from "src/models/new/search/search.actions";
import { getUserDataService } from "../services/getUserData.service";
import { InfoService } from "../components/info/info.component";

@Component({
  selector: "register-form",
  template: `
    
      <div
      class="content"
      type="template"
      [slides]="[page1, page2]"
      [animate]="onMobile"
    ></div>
    <ng-template #page1>
    <form
      [formGroup]="registerForm">
      <form
        class="full-width form-control curved-border"
        formGroupName="firstPage"
      >
      <div class="title-container">
        <h3 class="form-title" style="font-size: 1.25rem; font-weight: 600">Créer un compte !</h3>
        <span class="title-subtitle">Créer un compte avec 1 mois d'essai gratuit</span>
      </div>
        <h4 style="font-weight: 500;">Informations contact</h4>
        <div class="form-input">
          <label>Nom du contact</label>
          <input 
          #input1 (click)="onClickInputScroll(input1)"
          class="form-element" type="text" formControlName="lastname" />
        </div>
        <div class="form-input">
          <label>Prénom du contact</label>
          <input 
          #input2 (click)="onClickInputScroll(input2)"
          class="form-element" type="text" formControlName="firstname" />
        </div>

        <div class="form-input">
          <label>Adresse e-mail contact</label>
          <input 
          #input3 (click)="onClickInputScroll(input3)"
          class="form-element" type="email" formControlName="email" />
        </div>

        <div class="form-input">
          <label>Vérification addresse e-mail</label>
          <input
          #input4 (click)="onClickInputScroll(input4)"
            class="form-element"
            type="email"
            formControlName="emailVerification"
          />
        </div>

        <div class="form-input">
          <label>Mot de passe</label>
          <input
          #input5 (click)="onClickInputScroll(input5)"
            class="form-element"
            type="password"
            formControlName="password"
            id="idPassword"
          />
          <div (click)="togglePassword()" style="position: absolute; cursor: pointer; bottom: 0; right: 0; z=100">
            <img class="eye" src="assets/Oeil_ferme.svg" id="togglePassword">
          </div>
          </div>
        <div class="form-action">
          <button
            *ngIf="showSubmitButton"
            class="button discover gradient"
            style="width: 250px"
            (click)="slider.left()"
          >
            Etape suivante
          </button>
        </div>
        <div *ngIf="showSteps" class="form-step">
          <div class="active"></div>
          <div (click)="slider.left()"></div>
        </div>
      </form>
      </form>

    </ng-template>

    <ng-template #page2>
    <form
      [formGroup]="registerForm"
      (ngSubmit)="onSubmit($event)">
      <form
        class="full-width grow form-control curved-border"
        formGroupName="secondPage"
        
      >
        <h3 class="form-title">Créer un compte !</h3>
        <h4 class="form-subtitle">Informations contact</h4>
        <div class="form-input">
          <label>Je suis</label>
          <options
            formControlName="role"
            [options]="roles"
            type="radio"
            [searchable]="false"
            ifEmpty="..."
          >
          </options>
        </div>

        <div class="form-input">
          <label>Nom de l'entreprise</label>
          <input
          #input6 (click)="onClickInputScroll(input6)"
            class="form-element"
            type="text"
            class="form-element"
            formControlName="company"
            style="display: none"
          />
          <span class="position-relative">
            <input

              type="text"
              class="form-element"
              autocomplete="off"
              formControlName="companyName"
              [novalidate]="true"
              (input)="onCompanySearch($event)"
              #search
            />
            <img
              *ngIf="suggestionBox && suggestionBox.picked"
              src="assets/X.svg"
              class="cancel-company"
              (click)="cancelCompany() && search.focus()"
            />
          </span>
          <suggestion-box
            [query]="searchQuery | async"
            [action]="actions.GetCompanies"
            (choice)="onChoice($event)"
          ></suggestion-box>
        </div>

        <div class="form-input">
          <label>Métier</label>
          <options [options]="jobs" formControlName="jobs"></options>
        </div>

        <div class="condition-general-container flex row">
          <checkbox formControlName="conditionGeneral"></checkbox>
          <span style="font-size: 12px;">J'accepte les <span style="color: hsl(203deg 96% 48%); text-decoration: underline" (click)="openMentionLegal = true">Conditions Générales & les mentions légales</span> d'Utilisation BatiUni</span>
        </div>

        <div class="form-input parrain">
          <label>Code parrain ?</label>
          <input
            type="text"
            class="form-element"
            formControlName="proposer"
          />
        </div>

        <div
          *ngIf="showSubmitButton"
          class="form-action"
          style="margin-top: auto;"
        >
          <button
            class="button discover gradient"
            style="width: 250px"
            [disabled]="!registerForm.valid && !pending"
          >
            Valider
          </button>
        </div>

        <div
          *ngIf="registerForm.errors?.server"
          class="server-error center-text"
        >
          {{ registerForm.errors?.server }}
        </div>

        <div *ngIf="showSteps" class="form-step">
          <div (click)="slider.right()"></div>
          <div class="active"></div>
        </div>
      </form>
      </form>

    </ng-template>
    <slidemenu [(open)]="openMentionLegal" #mentionLegal>
      <h1 class="center-text full-width" header>Mentions légales</h1>
      <div class="modify-page hosted-page flex column center-cross space-children-margin" content>
        <app-mention-legal *ngIf="openMentionLegal"></app-mention-legal>
      </div>
    </slidemenu>
  `,
  styles: [
    `
      @use "src/styles/mixins" as *;
      @use "src/styles/variables" as *;

      :host{
        transition: height 200ms
      }
      :host(.mobile-view) {
        @extend %overflow-y;
        @include with-set-safe-area(
          margin,
          top,
          $paging-height + $paging-decoration-height
        );
        height: calc(
          100vh - #{$paging-height} - #{$paging-decoration-height} - 146px -
            env(safe-area-inset-top)
        );
      }

      :host(.footerHideMobile) {
        height: calc(100vh - #{$paging-height} - #{$paging-decoration-height} - env(safe-area-inset-top)) !important;
      }

      :host(:not(.mobile-view)) {
        max-height: 768px;
        align-self: center;
      }

      .form-title {
        font-size: 1.25rem;
        font-weight: 600
      }

      .title-subtitle {
        font-size: 0.95rem;
        color: $primary
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

      .cancel-company {
        position: absolute;
        bottom: 10px;
        right: 5px;
        transform-origin: center;
        transform: scale(0.7);
      }

      .condition-general-container {
        display: flex;
         checkbox{ 
           flex-shrink: 0
         }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterForm extends Destroy$ {
  //move this statement to parent
  @HostBinding("class")
  get classes() {
    return "hosted-page flex column";
  }

  onMobile: boolean = window.innerWidth <= 768;
  constructor(
    private store: Store,
    private router: Router,
    private cd: ChangeDetectorRef,
    private getUserDataService: getUserDataService,
    private info: InfoService,
  ) {
    super();
  }

  openMentionLegal: boolean = false;

  @ViewChild(UISuggestionBox)
  suggestionBox?: UISuggestionBox;

  @ViewChild(SlidesDirective, { static: true })
  slider!: SlidesDirective;

  @Input()
  showSteps: boolean = true;

  @Input()
  showSubmitButton: boolean = true;

  pending: boolean = false;

  ngOnInit() {

    this.info.alignWith('header')
    const ev = this.searchEvent.pipe(takeUntil(this.destroy$)),
      eachFour = ev.pipe(
        bufferCount(4),
        map((l: Event[]) => l[l.length - 1])
      ),
      eachSecond = ev.pipe(debounceTime(1000));

    let lastValue = "";
    merge(eachFour, eachSecond).subscribe((e: Event) => {
      const value = (e.target as HTMLInputElement).value;
      if (value !== lastValue) {
        lastValue = value;
        this.searchQuery.next(value);
      }
    });

    this.registerForm.valueChanges.subscribe((value) => {
    })
  }

  public registerForm = new FormGroup(
    {
      firstPage: new FormGroup(
        {
          lastname: new FormControl("", [Validators.required]),
          firstname: new FormControl("", [Validators.required]),
          email: new FormControl("", [Validators.required, Email()]),
          emailVerification: new FormControl("", [
            Validators.required,
            MatchField("email", "email", true),
          ]),
          password: new FormControl("", [ComplexPassword()])
        }),
      secondPage: new FormGroup({
        proposer: new FormControl(""),
        role: new FormControl([], [Validators.required]),
        company: new FormControl("", [
          Validators.required,
          RequiredType(
            "object",
            "MESSAGE",
            "Veuillez choisir une entreprise de la liste."
          ),
          TransferError("companyName"),
        ]),
        companyName: new FormControl(""),
        jobs: new FormControl([], [Validators.required]),
        conditionGeneral: new FormControl(false, [Validators.requiredTrue])
      }),
    },
    {}
  );

  onSubmit(f: any) {
    if (!this.pending) {
      this.pending = true;
      this.store
        .dispatch(Register.fromFormGroup(this.registerForm, false))
        .pipe(take(1))
        .subscribe(
          (success) => {
            this.getUserDataService.setRegisterForm(this.registerForm)
            this.router.navigate(["", "success"]);
            this.pending = false;
          },
          (errors) => {
            if(errors.hasOwnProperty('company')){
              this.info.show("error","Il existe déjà un compte avec cette entreprise", 3000);
            }
            if (errors.email) {
              errors.all = errors.all
                ? errors.all + "\n" + errors.email
                : errors.email;
            }
            setErrors(this.registerForm, errors);
            this.pending = false;
            this.cd.markForCheck();
          }
        );
    }
  }



  onClickInputScroll(input: HTMLElement){
    setTimeout(() => {
      input.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'})
      setTimeout(() => {
        input.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'})
      }, 500)
    }, 100)
  }

  onNavigate(dx: number, done?: Function) {
    if (dx > 0 && this.registerForm.get("firstPage")?.valid) this.slider.left();
    else this.slider.right();
  }

  searchQuery = new Subject<string>();
  searchEvent = new Subject<Event>();

  onCompanySearch(e: Event) {
    const value = (e.target as HTMLInputElement).value;

    if (!value) this.suggestionBox?.hideSuggestions();

    this.searchEvent.next(e);
    this.registerForm.get("secondPage")?.get("company")?.setValue(value);
  }

  actions = { GetCompanies };

  onChoice(establishment: Establishement) {
    this.registerForm.get("secondPage")?.get("company")?.setValue(establishment);
    this.registerForm.get("secondPage")?.get("companyName")?.setValue(establishment.name);
  }

  cancelCompany() {
    this.registerForm.get("secondPage")?.get("company")?.setValue("");
    this.registerForm.get("secondPage")?.get("companyName")?.setValue("");
    if (this.suggestionBox) this.suggestionBox!.cancel();
    return true;
  }

  @SnapshotAll("Job")
  jobs!: Job[];

  @SnapshotAll("Role")
  roles!: Role[];

  togglePassword() {
    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('#idPassword');
    let type = password?.getAttribute('type') === 'password' ? 'text' : 'password'
    let toggleClass = password?.getAttribute('type') === 'password' ? 'assets/Oeil_ouvert.svg' : 'assets/Oeil_ferme.svg'
    password?.setAttribute('type', type)
    togglePassword?.setAttribute('src', toggleClass)
  }
}
