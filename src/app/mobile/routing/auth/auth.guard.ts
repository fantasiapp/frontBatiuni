import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Store } from "@ngxs/store";
import { AuthState } from "src/models/auth/auth.state";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private store: Store) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if ( route.url[0]?.path == 'home' )
      return this.store.selectSnapshot(AuthState.isAutheticated) || this.router.parseUrl('/connexion');
    
    return !this.store.selectSnapshot(AuthState.isAutheticated) || this.router.parseUrl('/home');
  }
}