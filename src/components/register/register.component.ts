import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { VerifyField } from "src/validators/verify";

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: [
    './register.component.scss'
  ]
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
      VerifyField('email', 'emailVerifier')
    ]),
    emailVerifier: new FormControl('', [
      Validators.required,
      VerifyField('email', 'emailVerifier')
    ]),
    password: new FormControl(''),
    parrain: new FormControl(''),
    role: new FormControl(''),
    company: new FormControl(''),
    job: new FormControl('')
  });

  constructor() {

  }
};