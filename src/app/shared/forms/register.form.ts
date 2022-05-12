import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
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
        class="full-width form-control curved-border"
        [formGroup]="registerForm"
      >
        <h3 class="form-title">Créer un compte !</h3>
        <h4 class="form-subtitle">Informations contact</h4>
        <div class="form-input">
          <label>Nom du contact</label>
          <input class="form-element" type="text" formControlName="lastname" />
        </div>
        <div class="form-input">
          <label>Prénom du contact</label>
          <input class="form-element" type="text" formControlName="firstname" />
        </div>

        <div class="form-input">
          <label>Adresse e-mail contact</label>
          <input class="form-element" type="email" formControlName="email" />
        </div>

        <div class="form-input">
          <label>Vérification addresse e-mail</label>
          <input
            class="form-element"
            type="email"
            formControlName="emailVerification"
          />
        </div>

        <div class="form-input">
          <label>Mot de passe</label>
          <input
            class="form-element"
            type="password"
            formControlName="password"
          />
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
    </ng-template>

    <ng-template #page2>
      <form
        class="full-width grow form-control curved-border"
        [formGroup]="registerForm"
        (ngSubmit)="onSubmit($event)"
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

        <div class="form-input parrain">
          <label>Code parrain ?</label>
          <input
            type="password"
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
    </ng-template>
  `,
  styles: [
    `
      @use "src/styles/mixins" as *;
      @use "src/styles/variables" as *;

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

      :host(.footerHide) {
        height: calc(
          100vh - #{$paging-height} - #{$paging-decoration-height} -
            env(safe-area-inset-top)
        );
      }

      :host(:not(.mobile-view)) {
        max-height: 768px;
        align-self: center;
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
    private cd: ChangeDetectorRef
  ) {
    super();
  }

  @ViewChild(UISuggestionBox)
  suggestionBox?: UISuggestionBox;

  @ViewChild(SlidesDirective, { static: true })
  slider!: SlidesDirective;

  @Input()
  showSteps: boolean = true;

  @Input()
  showSubmitButton: boolean = true;

  pending: boolean = false;

  registerForm = new FormGroup(
    {
      lastname: new FormControl("", [Validators.required]),
      firstname: new FormControl("", [Validators.required]),
      email: new FormControl("", [Validators.required, Email()]),
      emailVerification: new FormControl("", [
        Validators.required,
        MatchField("email", "email", true),
      ]),
      password: new FormControl("", [ComplexPassword()]),
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
    },
    {}
  );

  onSubmit(f: any) {
    if (!this.pending) {
      this.pending = true;
      this.store
        .dispatch(Register.fromFormGroup(this.registerForm))
        .pipe(take(1))
        .subscribe(
          (success) => {
            this.router.navigate(["", "success"]);
          },
          (errors) => {
            if (errors.email) {
              errors.all = errors.all
                ? errors.all + "\n" + errors.email
                : errors.email;
            }
            setErrors(this.registerForm, errors);
            this.cd.markForCheck();
          }
        );
    }
  }

  ngOnInit() {
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
  }

  onNavigate(dx: number, done?: Function) {
    if (dx > 0) this.slider.left();
    else this.slider.right();
  }

  searchQuery = new Subject<string>();
  searchEvent = new Subject<Event>();

  onCompanySearch(e: Event) {
    const value = (e.target as HTMLInputElement).value;

    if (!value) this.suggestionBox?.hideSuggestions();

    this.searchEvent.next(e);
    this.registerForm.get("company")?.setValue(value);
  }

  actions = { GetCompanies };

  onChoice(establishment: Establishement) {
    this.registerForm.get("company")?.setValue(establishment);
    this.registerForm.get("companyName")?.setValue(establishment.name);
  }

  cancelCompany() {
    this.registerForm.get("company")?.setValue("");
    this.registerForm.get("companyName")?.setValue("");
    if (this.suggestionBox) this.suggestionBox!.cancel();
    return true;
  }

  @SnapshotAll("Job")
  jobs!: Job[];

  @SnapshotAll("Role")
  roles!: Role[];
}
