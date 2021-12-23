import { Action, Selector, State, StateContext } from "@ngxs/store";
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { AuthModel } from "./auth.model";
import { environment } from 'src/environments/environment';
import { Login, Logout, Register } from "./auth.actions";
import { catchError, tap } from "rxjs/operators";
import { of, throwError } from "rxjs";

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

  constructor(private http: HttpClient) {}

  @Action(Login)
  login(ctx: StateContext<AuthModel>, action: Login) {
    let {username, password} = action;
    let req = this.http.post(environment.backUrl + '/api-token-auth/', {username, password});
    
    return req.pipe(
      catchError((err) => {
        return throwError(err.error);
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
      })
    );
  }
  
  @Action(Register)
  register(ctx: StateContext<AuthModel>, action: Register) {
    let req = this.http.post(environment.backUrl + '/data/', action, {
      headers: {
        Authorization: "Basic " + ctx.getState().token,
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