import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: [
    './register.component.scss'
  ]
})
export class RegisterComponent {
  registerForm = new FormGroup({
    lastname: new FormControl(''),
    firstname: new FormControl(''),
    email: new FormControl(''),
    emailVerifier: new FormControl(''),
    password: new FormControl(''),
    parrain: new FormControl(''),
    role: new FormControl(''),
    company: new FormControl(''),
    job: new FormControl([])
  });

  
};