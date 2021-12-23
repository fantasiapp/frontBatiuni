import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { Login, Logout } from "src/auth/auth.actions";
import { AuthModel } from "src/auth/auth.model";
import { AuthState } from "src/auth/auth.state";

@Component({
  selector: 'connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnexionComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ])
  });

  private _errors: string[] = [];
  get errors() { return this._errors; }

  addErrors(errors: {[key: string]: string}) {
    this._errors = Object.values(errors);
    this.cd.markForCheck();
  }

  clearErrors() {
    this._errors = [];
    this.cd.markForCheck();
  }

  constructor(private router: Router, private store: Store, private cd: ChangeDetectorRef) {
    this.auth$.subscribe(console.log);
    this.token$.subscribe(console.log)
  }

  onChange() {
    this.clearErrors();
  }

  @Select(AuthState)
  auth$!: Observable<AuthModel>;

  @Select(AuthState.token)
  token$!: Observable<string>;

  async onSubmit(e: any) {

    let { email, password } = this.loginForm.value;
    this.store.dispatch(new Login(email, password)).pipe(take(1)).subscribe(
      success => {
        this.router.navigate(['', 'confirmed']);
      },
      errors => {
        this.addErrors(errors);
      }
    );

  }
};