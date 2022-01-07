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
            <div *ngIf="registerForm.get('email')!.errors" class="server-error">
              {{ registerForm.get('email')!.errors?.server }}
            </div>
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
            <div *ngIf="registerForm.errors?.server" class="server-error">
              {{ registerForm.errors?.server }}
            </div>
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
      Email
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

  jobs: Option[] = [
    {id:1,name:"TCE", checked:false},
    {id:2,name:"Cuisiniste" , checked:false},
    {id:3,name:"Ingénieur en Aménagement et Urbanisme" , checked:false},
    {id:4,name:"Ingénieur d'affaires du BTP" , checked:false},
    {id:5,name:"Economiste de la construction", checked:false},
    {id:6,name:"Dessinateur technique", checked:false},
    {id:7,name:"Conducteur de travaux bâtiment", checked:false},
    {id:8,name:"Chef d'équipe BTP", checked:false},
    {id:9, name:"Calculateur projeteur en béton armé", checked:false},
    {id:10,name:"Technicien Expert VRD", checked:false},
    {id:11,name:"Métreur", checked:false},
    {id:12,name:"Maître d’œuvre", checked:false},
    {id:13,name:"Ingénieur en Génie Civil", checked:false},
    {id:14,name:"Géomètre topographe", checked:false},
    {id:15,name:"Assistant d’entrepreneur du BTP", checked:false},
    {id:16,name:"Aide-conducteur de travaux", checked:false},
    {id:17,name:"Acousticien", checked:false},
    {id:18,name:"Ingénieur études de prix", checked:false},
    {id:19,name:"Peintre décorateur", checked:false},
    {id:20,name:"Chef de chantier", checked:false},
    {id:21,name:"Conducteur d’engins", checked:false},
    {id:22,name:"Agenceur de cuisines et de salles de bains", checked:false},
    {id:23,name:"Vitrier", checked:false},
    {id:24,name:"Vitrailliste", checked:false},
    {id:25,name:"Restaurateur d’art", checked:false},
    {id:26,name:"Menuisier", checked:false},
    {id:27,name:"Terrassier", checked:false},
    {id:28,name:"Maçon", checked:false},
    {id:29,name:"Dessinateur-Projeteur", checked:false},
    {id:30,name:"Couvreur-zingueur", checked:false},
    {id:31,name:"Serrurier", checked:false},
    {id:32,name:"Plombier", checked:false},
    {id:33,name:"Electricien", checked:false},
    {id:34,name:"Chauffagiste", checked:false},
    {id:35,name:"Carreleur faïenceur", checked:false},
    {id:36,name:"Câbleur", checked:false},
    {id:37,name:"Bainiste", checked:false},
    {id:38,name:"Collaborateur d’architecte", checked:false},
    {id:39,name:"Charpentier", checked:false},
    {id:40,name:"Designer", checked:false},
    {id:41,name:"Ferronnier d’art", checked:false}
  ];
};