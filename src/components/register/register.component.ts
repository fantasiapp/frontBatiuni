import { ChangeDetectionStrategy, Component, ContentChildren, HostBinding, HostListener, QueryList, TemplateRef, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { SlidesDirective } from "src/directives/slides.directive";
import { VerifyField } from "src/validators/verify";
import { Option } from "../options/options";

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