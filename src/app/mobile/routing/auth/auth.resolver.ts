import { Injectable } from "@angular/core";
import { Resolve, Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { AuthState } from "src/models/auth/auth.state";
import { GetUserData } from "src/models/user/user.actions";
import { UserState } from "src/models/user/user.state";

@Injectable()
export class AuthResolver implements Resolve<any> {
  constructor(private store: Store, private router: Router) {}

  resolve() {
    let token = this.store.selectSnapshot(AuthState.token),
      user = this.store.selectSnapshot(UserState);
    
    if ( user.profile ) return true;
    if ( !token ) return throwError('no token');

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