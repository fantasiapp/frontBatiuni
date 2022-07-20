import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Store } from "@ngxs/store";
import { AuthState } from "src/models/auth/auth.state";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private store: Store) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const authenticated = this.store.selectSnapshot(AuthState.isAutheticated);

    if ( route.url[0]?.path == 'home' ) {
      //if we want to access home
      return authenticated ? true : this.router.parseUrl('/connexion');
    };

    //for other pages that shouldnt be seen if we're connected
    return !authenticated ? true : this.router.parseUrl('/home');
  }
}