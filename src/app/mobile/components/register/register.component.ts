import { ChangeDetectionStrategy, Component, HostListener, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Store } from "@ngxs/store";
import { Register } from "src/models/auth/auth.actions";
import { SlidesDirective } from "src/app/shared/directives/slides.directive";
import { MatchField } from "src/validators/verify";
import { Router } from "@angular/router";
import { RegisterForm } from "src/app/shared/forms/register.form";

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
      Validators.email
    ]),
    emailVerification: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.minLength(8)
    ]),
    proposer: new FormControl(''),
    role: new FormControl(''),
    company: new FormControl(''),
    jobs: new FormControl([])
  }, { validators: MatchField('email', 'emailVerification') });
  
  constructor(private store: Store, private router: Router) {}


  @ViewChild(SlidesDirective, { static: true })
  slider!: SlidesDirective;


  ngOnInit() { }

  @ViewChild(RegisterForm, {static: true})
  form!: RegisterForm;

  onSubmit(f: any) {
    console.log(this.registerForm.value);
    this.store.dispatch(Register.fromFormGroup(this.registerForm));
    this.router.navigate(['confirmed'])
  }

  @HostListener('swipeleft')
  onSwipeLeft() {
    this.form.onNavigate(1);
  }

  @HostListener('swiperight')
  onSwipeRight() {
    this.form.onNavigate(-1);
  }
};