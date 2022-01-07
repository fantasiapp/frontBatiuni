import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { Login } from "src/models/auth/auth.actions";
import { AuthModel } from "src/models/auth/auth.model";
import { AuthState } from "src/models/auth/auth.state";
import { Destroy$ } from "src/common/classes";
import { setErrors } from "src/validators/verify";
import { ComplexPassword } from "src/validators/verify";
import { getGeneraleData, getUserData } from "src/models/user/user.actions";
import { Mapping } from "./mapping.response";

@Component({
  selector: 'connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnexionComponent extends Destroy$ {
  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      //Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
    ])
  }, { /*validators: ComplexPassword('password')*/ });

  private _errors: string[] = [];
  get errors() { return this._errors; }

  constructor(private router: Router, private store: Store, private cd: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {

    
  }

  @Select(AuthState)
  auth$!: Observable<AuthModel>;

  @Select(AuthState.token)
  token$!: Observable<string>;

  async onSubmit(e: any) {
    let { email, password } = this.loginForm.value;
    this.store.dispatch(new Login(email, password))
    .pipe(take(1)).subscribe(
      success => {
        this.store.dispatch(new getUserData(success.app.auth.token)).subscribe()
        this.router.navigate(['', 'home']);
      },
      errors => {
        setErrors(this.loginForm, errors);
        this.cd.markForCheck();
      }
    );
  }
};