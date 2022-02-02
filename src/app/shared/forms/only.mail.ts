import { Component, ChangeDetectorRef} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ChangeDetectionStrategy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { ForgotPassword } from "src/models/auth/auth.actions";
import { take } from "rxjs/operators";
import { setErrors } from "src/validators/verify";
import { HttpClient } from "@angular/common/http";
import { HttpService } from "src/app/services/http.service";
import { InfoService } from "../components/info/info.component";
import { Email } from "src/validators/persist";


@Component({
  selector: 'mail-form',
  template: `
    <!-- Form -->
    <form class="full-height form-control curved-border" [formGroup]="mailSender" (ngSubmit)="onSubmit($event)">
    <!-- Main title ex: Je me connecte, Créer un compte  -->
      <h3 class="form-title">Récupérer votre mot de passe</h3>
      <div class="form-input">
          <label >Votre adresse mail </label>
          <input class="form-element" type="mail" formControlName="mail" placeholder="email@email.com"/>
      </div>
      
      <div class="form-action">
        
        <button class="button discover gradient" 
         
        style="width: 250px;" [disabled]="!mailSender.valid">Valider</button>
      </div>
     
    </form>
    `,
  styles: [`
    @import 'src/styles/mixins';
    
  `],
  changeDetection: ChangeDetectionStrategy.OnPush

})

export class MailForm {
  constructor(private http: HttpService,private info: InfoService,
    private router: Router) { }
  mailsent : boolean = false;
  mailSender = new FormGroup({
    mail: new FormControl('',
      [Validators.required,
    Email()]),
    
  })
  onSubmit(e:Event){
    this.info.show("info","loading....",Infinity);
    let req = this.http.get('initialize', {
        email: this.mailSender.value.mail, 
        action: "forgetPassword"
    });


    req.pipe(take(1)).subscribe(
        (data:any) => {

            if(data?.messages == "work in progress"){
              this.info.show('success',data?.messages,200)
              this.mailsent = true
            }else {
              this.info.show('error',"L'adresse n'est pas reconnue",3000)
              this.mailsent = true

            }
        },
        error => {
            console.log(error)
            this.info.show("error","",5000);

        }
    )
  }
 
}