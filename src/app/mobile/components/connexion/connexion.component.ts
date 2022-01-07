import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { Login, Logout } from "src/models/auth/auth.actions";
import { AuthModel } from "src/models/auth/auth.model";
import { AuthState } from "src/models/auth/auth.state";
import { Destroy$ } from "src/common/classes";
import { ComplexPassword } from "src/validators/verify";
import { getGeneraleData, getUserData } from "src/models/user/user.actions";
import { Mapping } from "./mapping.response";
import {  setErrors } from "src/validators/verify";

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
  // data = {
  //   "UserprofileFields": [
  //       "user",
  //       "company",
  //       "firstName",
  //       "lastName",
  //       "proposer",
  //       "role",
  //       "cellPhone",
  //       "jobs"
  //   ],
  //   "UserprofileIndices": [
  //       1,
  //       5,
  //       7
  //   ],
  //   "UserprofileValues": {
  //       "2": [
  //           "anasschatoui@gmail.com",
  //           1,
  //           "Majed",
  //           "Majed",
  //           null,
  //           1,
  //           null,
  //           [
  //               1,
  //               2,
  //               3
  //           ]
  //       ]
  //   },
  //   "CompanyFields": [
  //       "name",
  //       "siret",
  //       "capital",
  //       "logo",
  //       "webSite",
  //       "stars",
  //       "companyPhone"
  //   ],
  //   "CompanyValues": {
  //       "1": [
  //           "Fantasiapp",
  //           null,
  //           null,
  //           null,
  //           null,
  //           null,
  //           null
  //       ]
  //   }
// }
  ngOnInit() {
    // this.store.dispatch(new getGeneraleData()).subscribe(
    //   console.log
    // )
    // let mapping = new Mapping(this.data)
    // console.log(mapping.companyData)
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