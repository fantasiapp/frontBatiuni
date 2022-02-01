import { ChangeDetectionStrategy } from "@angular/compiler/src/core";
import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";


@Component({
    selector: 'forgot-password',
    template: `
    <!-- Form -->
    <form class="full-height form-control curved-border" [formGroup]="forgotPassword" (ngSubmit)="onSubmit($event)">
    <!-- Main title ex: Je me connecte, Créer un compte  -->
      <h3 class="form-title">Mot de passe Oublie</h3>
      <div class="form-input">
          <label >Nouveau mot de passe</label>
          <input class="form-element" type="password" formControlName="password"/>
          <!-- <div *ngIf="forgotPassword.get('password')!.touched && forgotPassword.get('password')!.errors?.minlength" class="error">Doit contenir au moins 8 caractères</div> -->
          <!-- <div *ngIf="forgotPassword.get('password')!.touched && forgotPassword.get('password')!.errors?.uppercase" class="error">Doit contenir au moins une lettre en majuscule</div> -->
          <!-- <div *ngIf="forgotPassword.get('password')!.touched && forgotPassword.get('password')!.errors?.lowercase" class="error">Doit contenir au moins une lettre en miniscule</div> -->          
      </div>
      <div class="form-input">
          <label >Confirmation de mot de passe</label>
          <input type="password" class="form-element" formControlName="confirmedPassword"/>
          <!-- <div *ngIf="forgotPassword.get('confirmedPassword')!.touched && forgotPassword.get('confirmedPassword')!.errors?.minlength" class="error">Doit contenir au moins 8 caractères</div> -->
          <!-- <div *ngIf="forgotPassword.get('confirmedPassword')!.touched && forgotPassword.get('confirmedPassword')!.errors?.uppercase" class="error">Doit contenir au moins une lettre en majuscule</div> -->
          <!-- <div *ngIf="forgotPassword.get('confirmedPassword')!.touched && forgotPassword.get('confirmedPassword')!.errors?.lowercase" class="error">Doit contenir au moins une lettre en miniscule</div> -->
      </div>
      <a class="external-links form-links block text-right">
        Mot de passe oublié !
      </a>
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

    forgotPassword = new FormGroup({
        password : new FormControl('',
        [Validators.required]),
        confirmedPassword : new FormControl('',
        [Validators.required]
        )
    })

    async onSubmit(e: any) {
        let {password, confirmedPassword} = this.forgotPassword.value;
    }
}