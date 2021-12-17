import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { Login, Logout } from "src/auth/auth.actions";

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
    
  }

  onChange() {
    this.clearErrors();
  }

  async onSubmit(e: any) {
    let { email, password } = this.loginForm.value;
    this.store.dispatch(new Login(email, password)).subscribe(
      success => {
        this.router.navigate(['', 'confirmed']);
      },
      errors => {
        this.addErrors(errors);
      }
    );

    this.store.dispatch(new Logout());
    return 
  }
};