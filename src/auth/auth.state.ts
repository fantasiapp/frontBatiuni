import { Action, Actions, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { AuthModel } from "./auth.model";
import { AuthService } from "./auth.service";
import { Login, Logout } from "./auth.actions";
import { tap } from "rxjs/operators";
import { of } from "rxjs";

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

  constructor(private authService: AuthService) {}

  @Action(Login)
  login(ctx: StateContext<AuthModel>, action: Login) {
    return this.authService.login(action).pipe(
      tap((response: any) => {
        let token = response['token'];
        ctx.setState({
          token,
          username: action.username
        });
        console.log('>>', ctx.getState());
      })
    );
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthModel>) {
    const state = ctx.getState();
    if ( !state.token ) return of(true);
    return this.authService.logout(state.token).pipe(
      tap(() => {
        ctx.setState({token: null, username: null});
        console.log('>>', ctx.getState());
      })
    );
  }
};