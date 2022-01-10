import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { catchError, tap } from "rxjs/operators";
import { AuthState } from "src/models/auth/auth.state";
import { environment } from "src/environments/environment";
import { ChangePassword, ChangeProfileType, ChangeProfilePicture, GetUserData, ModifyUserProfile } from "./user.actions";
import { User } from "./user.model";
import { Logout } from "../auth/auth.actions";
import { throwError } from "rxjs";
import { Mapper } from "../data/mapper.model";
import { UserProfile } from "../data/data.model";

@State<User>({
  name: 'user',
  defaults: new User
})
@Injectable()
export class UserState {
  @Selector()
  static type(state: User) { return state.type; }

  @Selector()
  static profile(state: User) { return state.profile; }

  constructor(private store: Store, private http: HttpClient) { 
  }

  @Action(ChangeProfileType)
  changeProfileType(ctx: StateContext<User>, action: ChangeProfileType) {
    return ctx.patchState({type: action.type});
  }

  @Action(ChangeProfilePicture)
  changeProfilePicture(ctx: StateContext<User>, action: ChangeProfilePicture) {
    return ctx.patchState({imageUrl: action.src});
  }

  @Action(ChangePassword) 
  modifyPassword(ctx: StateContext<User>, action: ChangePassword) {
    console.log(this.store.selectSnapshot(AuthState));
    let token = this.store.selectSnapshot(AuthState).token;
    let req = this.http.post(environment.backUrl + '/data/', action, {
      headers: {
        Authorization: "Token " + token,
        'Content-Type': 'application/json'
      }
    })

    return req.pipe(
      tap((response: any) => console.log(response))
    );
  }

  @Action(GetUserData)
  getUserData(ctx: StateContext<User>, action: GetUserData) {
    let {token} = action
    let req = this.http.get(environment.backUrl + '/data/?action=getUserData', {
      headers: {
        "Authorization": `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return req.pipe(
      catchError((err: HttpErrorResponse) => {
        this.store.dispatch(new Logout());
        return throwError(err);
      }),
      tap((response: any)=> {
        Mapper.mapTable(response, 'Userprofile');
        const currentUser = [...UserProfile.instances.values()][0];
        ctx.patchState({profile: currentUser})
      })
    )
  }

  @Action(Logout)
  logout(ctx: StateContext<User>) {
    ctx.patchState({type: false, imageUrl: null, profile: null});
  }

  @Action(ModifyUserProfile) 
  modifyUser(ctx: AuthState, action: ModifyUserProfile) {
    let token = this.store.selectSnapshot(AuthState).token;

    const profile = this.store.selectSnapshot(UserState.profile)!,
      json = Mapper.mapModifyForm(profile, action.changes);
    
    let req = this.http.post(environment.backUrl + '/data/?action="modifyUser"', json, {
      headers : {
        "Authorization": `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return req.pipe(
      tap((response: any) => console.log(response))
    );
  }
};