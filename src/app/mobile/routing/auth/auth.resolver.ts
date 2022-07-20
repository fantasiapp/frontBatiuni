import { Injectable } from "@angular/core";
import { Resolve, Router } from "@angular/router";
import { MyStore } from "src/app/shared/common/classes";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Logout } from "src/models/auth/auth.actions";
import { AuthState } from "src/models/auth/auth.state";
import { DataState } from "src/models/new/data.state";
import { GetUserData } from "src/models/new/user/user.actions";

@Injectable()
export class AuthResolver implements Resolve<any> {
  constructor(private store: MyStore, private router: Router) {}

  resolve() {
    let token = this.store.selectSnapshot(AuthState.token),
      userId = this.store.selectSnapshot(DataState.currentUserId);
    
    if ( userId !== -1 ) return true;
    if ( !token ) return throwError('no token');

    return this.store.dispatch(new GetUserData(token!))
      .pipe(
        catchError(() => {
          this.store.dispatch(new Logout());
          this.router.navigate(['']);
          return throwError('GetUserData Failed.');
        })
      );
  }
};