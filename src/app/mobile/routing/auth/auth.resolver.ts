import { Injectable } from "@angular/core";
import { Resolve, Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { AuthState } from "src/models/auth/auth.state";
import { UserProfileRow } from "src/models/data/data.model";
import { GetUserData } from "src/models/user/user.actions";

@Injectable()
export class AuthResolver implements Resolve<any> {
  constructor(private store: Store, private router: Router) {}

  resolve() {
    let token = this.store.selectSnapshot(AuthState.token);
    console.log(token);

    return this.store.dispatch(new GetUserData(token!))
      .pipe(
        catchError(() => {
          this.router.navigate(['']);
          return throwError('GetUserData Failed.');
        }),
        tap(() => {

        })
      );
  }
};