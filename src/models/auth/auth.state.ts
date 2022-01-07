import { Action, Selector, State, StateContext } from "@ngxs/store";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { AuthModel } from "./auth.model";
import { environment } from 'src/environments/environment';
import { Login, Logout, Register } from "./auth.actions";
import { catchError, tap } from "rxjs/operators";
import { of, throwError } from "rxjs";
import * as strings from '../../common/strings';
import { Router } from "@angular/router";
import { Mapping } from "src/app/mobile/components/connexion/mapping.response";

@State<AuthModel>({
  name: 'auth',
  defaults: { token: null, username: null }
})
@Injectable()
export class AuthState {
  @Selector()
  static token(state: AuthModel): string | null { return state.token; }

  @Selector()
  static isAutheticated(state: AuthModel): boolean { return !!state.token; }

  constructor(private http: HttpClient, private router: Router) {}

  @Action(Login)
  login(ctx: StateContext<AuthModel>, action: Login) {
    let {username, password} = action;
    let req = this.http.post(environment.backUrl + '/api-token-auth/', {username, password}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return req.pipe(
      catchError((err: HttpErrorResponse) => {
        let error;
        if ( err.status == 404 ) error = strings.requests.INVALID_CONFIG; 
        else if ( err.status == 500 ) error = strings.requests.SERVER_UNAVAILABLE;
        else if ( err.status == 400 ) error = strings.requests.INVALID_CREDENTIALS;
        else error = strings.requests.UNEXPECTED_ERROR;
        return throwError({all: error});
      }),
      tap((response: any) => {
        let token = response['token'];
        ctx.setState({
          token,
          username: action.username
        });
      })
    );
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthModel>) {
    const state = ctx.getState();
    if ( !state.token ) return of(true);
    let req = of(true); /* data to disconnect */
    return req.pipe(
      tap(() => {
        ctx.setState({token: null, username: null});
        this.router.navigate(['', 'connexion'])
      })
    );
  }
  
  @Action(Register)
  register(ctx: StateContext<AuthModel>, action: Register) {
    let req = this.http.post(environment.backUrl + '/register/', action, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return req.pipe(
      catchError(err => throwError(err)),
      tap((response: any) => {
        ctx.setState({username: '<void>', token: response['token']})
      })
    )
  };

  
};