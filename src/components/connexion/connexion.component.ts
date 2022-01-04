import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { Login, Logout } from "src/auth/auth.actions";
import { AuthModel } from "src/auth/auth.model";
import { AuthState } from "src/auth/auth.state";
import { Destroy$ } from "src/common/classes";

@Component({
  selector: 'connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnexionComponent extends Destroy$ {
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
    super()
  }

  ngOnInit() {
    this.auth$.pipe(takeUntil(this.destroy$)).subscribe(t => console.log('auth$', t));
    this.token$.pipe(takeUntil(this.destroy$)).subscribe(t => console.log('token$', t))
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
        this.router.navigate(['', 'home']);
      },
      errors => {
        this.addErrors(errors);
      }
    );

  }
};