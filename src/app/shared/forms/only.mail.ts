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


@Component({
  selector: 'forgot-password-form',
  template: `
    <!-- Form -->
    <form class="full-height form-control curved-border" [formGroup]="mailSender" (ngSubmit)="onSubmit($event)">
    <!-- Main title ex: Je me connecte, Créer un compte  -->
      <h3 class="form-title">Récupérer votre mot de passe</h3>
      <div class="form-input">
          <label >Nouveau mot de passe</label>
          <input class="form-element" type="mail" formControlName="mail"/>
      </div>
      
      <div class="form-action">
        
        <button class="button discover gradient" style="width: 250px;" [disabled]="!forgotPassword.touched || forgotPassword.status === 'INVALID'">Valider</button>
      </div>
     
    </form>`,
  styles: [`
    @import 'src/styles/mixins';

  `],
  changeDetection: ChangeDetectionStrategy.OnPush

})

export class ForgotPasswordForm {

  constructor(private http: HttpService) { }
  token: any;

  mailSender = new FormGroup({
    mail: new FormControl('',
      [Validators.required,
    Validators.email]),
    
  })
  onSubmit(){
    let req = this.http.post('initialize', {
        mail:this.mailSender.value,
        action: "requestPassword"
    })

    req.pipe(take(1)).subscribe(
        data => 
    )
  }
 
}