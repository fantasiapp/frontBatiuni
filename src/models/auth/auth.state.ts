import { Action, Selector, State, StateContext } from "@ngxs/store";
import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
} from "@angular/common/http";
import { Injectable, NgZone } from "@angular/core";
import { AuthModel } from "./auth.model";
import { environment } from "src/environments/environment";
import {
  ConfirmAccount,
  Login,
  Logout,
  Register,
  ForgotPassword,
} from "./auth.actions";
import { catchError, delay, map, tap, timeout } from "rxjs/operators";
import { Observable, of, throwError } from "rxjs";
import * as strings from "../../app/shared/common/strings";
import { Router } from "@angular/router";
import { HttpService } from "src/app/services/http.service";
import { MyStore } from "src/app/shared/common/classes";

@State<AuthModel>({
  name: "auth",
  defaults: { token: null, username: null, pendingEmail: "" },
})
@Injectable()
export class AuthState {
  @Selector()
  static token(state: AuthModel): string | null {
    return state.token;
  }

  @Selector()
  static isAutheticated(state: AuthModel): boolean {
    return !!state.token;
  }

  static handleError(err: HttpErrorResponse): Observable<never> {
    let error;
    if (err.status == 404) error = strings.requests.INVALID_CONFIG;
    else if (err.status == 500) error = strings.requests.SERVER_UNAVAILABLE;
    else if (err.status == 400) error = strings.requests.INVALID_CREDENTIALS;
    else error = strings.requests.UNEXPECTED_ERROR;
    return throwError({ all: error });
  }

  constructor(
    private http: HttpService,
    private router: Router,
    private zone: NgZone
  ) {}

  @Action(Login)
  login(ctx: StateContext<AuthModel>, action: Login) {
    let { username, password } = action
    let req = this.http.post("api-token-auth", { username, password });

    return req.pipe(
      catchError((err: HttpErrorResponse) => {
        return AuthState.handleError(err);
      }),
      tap((response: any) => {
        let token = response["token"];
        ctx.patchState({
          token,
          username: action.username,
        });
      })
    );
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthModel>) {
    const state = ctx.getState();
    if (!state.token) return of(true);
    let req = of(true); /* data to disconnect */
    return req.pipe(
      tap(() => {
        ctx.patchState({ token: null, username: null });
        this.zone.run(() => {
          this.router.navigate(["", "connexion"]);
        });
      })
    );
  }

  @Action(Register)
  register(ctx: StateContext<AuthModel>, action: Register) {
    const req = this.http.post("initialize", action);
    return req.pipe(
      catchError((err: HttpErrorResponse) => {
        return AuthState.handleError(err);
      }),
      map((response: any) => {
        if (response["register"] == "OK") return true;
        throw response.messages;
      }),
      tap(() => {
        ctx.patchState({ pendingEmail: action.email });
      })
    );
  }

  @Action(ConfirmAccount)
  confirmAccount(ctx: StateContext<AuthModel>, { token }: ConfirmAccount) {
    const req = this.http.get("initialize", {
      action: "registerConfirm",
      token,
    });

    return req.pipe(
      tap((result: any) => {
        if (result["registerConfirm"] == "Error") throw result["messages"];

        ctx.patchState({ pendingEmail: "" });
      })
    );
  }
  @Action(ForgotPassword)
  forgotPassword(ctx: StateContext<AuthModel>, data: ForgotPassword) {
    let { token, password } = data;
    const req = this.http.post("initialize", {
      action: "newPassword",
      token,
      password,
    });
    return req.pipe(
      tap((res: any) => {
        if (res["newPassword"] == "Error") throw res["messages"];
        else return true;
      })
    );
  }
}
