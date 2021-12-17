import { ChangeDetectionStrategy, Component, ContentChildren, HostBinding, HostListener, QueryList, TemplateRef, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { SlidesDirective } from "src/directives/slides.directive";
import { VerifyField } from "src/validators/verify";
import { Job } from "../options/options";

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  registerForm = new FormGroup({
    lastname: new FormControl('', [
      Validators.required
    ]),
    firstname: new FormControl('', [
      Validators.required
    ]),
    email: new FormControl('', [
      Validators.required,
    ]),
    emailVerification: new FormControl('', [
      Validators.required,
    ]),
    password: new FormControl('', [
      Validators.minLength(8)
    ]),
    parrain: new FormControl(''),
    role: new FormControl(''),
    company: new FormControl(''),
    name: new FormControl('')
  }, {validators: VerifyField('email', 'emailVerification')});

  @ViewChild(SlidesDirective, {static: true})
  slider!: SlidesDirective;


  onSubmit(f: any) {

  }

  onNavigate(dx: number) {
    if ( dx > 0 ) this.slider.left();
    else this.slider.right();
  }

  @HostListener('swipeleft')
  onSwipeLeft() {
    this.onNavigate(1);
  }

  @HostListener('swiperight')
  onSwipeRight() {
    this.onNavigate(-1);
  }

  jobs: Job[] = [
    {id:1,name:"TCE", isChecked:false},
    {id:2,name:"Cuisiniste" , isChecked:false},
    {id:3,name:"Ingénieur en Aménagement et Urbanisme" , isChecked:false},
    {id:4,name:"Ingénieur d'affaires du BTP" , isChecked:false},
    {id:5,name:"Economiste de la construction", isChecked:false},
    {id:6,name:"Dessinateur technique", isChecked:false},
    {id:7,name:"Conducteur de travaux bâtiment", isChecked:false},
    {id:8,name:"Chef d'équipe BTP", isChecked:false},
    {id:9, name:"Calculateur projeteur en béton armé", isChecked:false},
    {id:10,name:"Technicien Expert VRD", isChecked:false},
    {id:11,name:"Métreur", isChecked:false},
    {id:12,name:"Maître d’œuvre", isChecked:false},
    {id:13,name:"Ingénieur en Génie Civil", isChecked:false},
    {id:14,name:"Géomètre topographe", isChecked:false},
    {id:15,name:"Assistant d’entrepreneur du BTP", isChecked:false},
    {id:16,name:"Aide-conducteur de travaux", isChecked:false},
    {id:17,name:"Acousticien", isChecked:false},
    {id:18,name:"Ingénieur études de prix", isChecked:false},
    {id:19,name:"Peintre décorateur", isChecked:false},
    {id:20,name:"Chef de chantier", isChecked:false},
    {id:21,name:"Conducteur d’engins", isChecked:false},
    {id:22,name:"Agenceur de cuisines et de salles de bains", isChecked:false},
    {id:23,name:"Vitrier", isChecked:false},
    {id:24,name:"Vitrailliste", isChecked:false},
    {id:25,name:"Restaurateur d’art", isChecked:false},
    {id:26,name:"Menuisier", isChecked:false},
    {id:27,name:"Terrassier", isChecked:false},
    {id:28,name:"Maçon", isChecked:false},
    {id:29,name:"Dessinateur-Projeteur", isChecked:false},
    {id:30,name:"Couvreur-zingueur", isChecked:false},
    {id:31,name:"Serrurier", isChecked:false},
    {id:32,name:"Plombier", isChecked:false},
    {id:33,name:"Electricien", isChecked:false},
    {id:34,name:"Chauffagiste", isChecked:false},
    {id:35,name:"Carreleur faïenceur", isChecked:false},
    {id:36,name:"Câbleur", isChecked:false},
    {id:37,name:"Bainiste", isChecked:false},
    {id:38,name:"Collaborateur d’architecte", isChecked:false},
    {id:39,name:"Charpentier", isChecked:false},
    {id:40,name:"Designer", isChecked:false},
    {id:41,name:"Ferronnier d’art", isChecked:false}
  ];
};