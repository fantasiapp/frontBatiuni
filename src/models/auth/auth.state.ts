import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable, NgZone } from "@angular/core";
import { AuthModel } from "./auth.model";
import { environment } from 'src/environments/environment';
import { ConfirmAccount, Login, Logout, Register } from "./auth.actions";
import { catchError, delay, map, tap, timeout } from "rxjs/operators";
import { Observable, of, throwError } from "rxjs";
import * as strings from '../../common/strings';
import { Router } from "@angular/router";

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

  static handleError(err: HttpErrorResponse): Observable<never> {
    let error;
    if ( err.status == 404 ) error = strings.requests.INVALID_CONFIG; 
    else if ( err.status == 500 ) error = strings.requests.SERVER_UNAVAILABLE;
    else if ( err.status == 400 ) error = strings.requests.INVALID_CREDENTIALS;
    else error = strings.requests.UNEXPECTED_ERROR;
    return throwError({all: error});
  };

  constructor(private http: HttpClient, private router: Router, private zone: NgZone,private store:Store) {}

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
        return AuthState.handleError(err);
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
        console.log('token in now void');
        this.zone.run(() => {
          console.log('navigating to /connexion')
          this.router.navigate(['', 'connexion']);
        })
      })
    );
  }
  
  @Action(Register)
  register(ctx: StateContext<AuthModel>, action: Register) {
    let req = this.http.post(environment.backUrl + '/initialize/', action, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return req.pipe(
      catchError((err: HttpErrorResponse) => {
        return AuthState.handleError(err);
      }),
      map((response: any) => {
        if ( response['register'] == 'OK' )
          return true;
        throw response.messages;
      })
    )
  };

  @Action(ConfirmAccount)
  async confirmAccount(ctx: StateContext<AuthModel>, {token}: ConfirmAccount) {
    const req = this.http.get(environment.backUrl + `/initialize/`, {
      params: {
        action: 'registerConfirm',
        token
      }
    });

    const result: any = await req.toPromise();
    console.log(result);
    if ( result['registerConfirm'] == 'Error' ) throw result['messages'];
  }
};