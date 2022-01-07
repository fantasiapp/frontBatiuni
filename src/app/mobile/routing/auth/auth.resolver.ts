import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Store } from "@ngxs/store";
import { tap } from "rxjs/operators";
import { AuthState } from "src/models/auth/auth.state";
import { UserProfile } from "src/models/data/data.model";
import { getUserData } from "src/models/user/user.actions";

@Injectable()
export class AuthResolver implements Resolve<any> {
  constructor(private store: Store) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let token = this.store.selectSnapshot(AuthState.token);
    console.log(token);

    return this.store.dispatch(new getUserData(token!))
      .pipe(
        tap(() => {
          console.log(UserProfile.instances)
        })
      );
  }
};