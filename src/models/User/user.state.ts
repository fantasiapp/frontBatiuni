import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { tap } from "rxjs/operators";
import { AuthState } from "src/models/auth/auth.state";
import { environment } from "src/environments/environment";
import { ChangePassword, ChangeProfileType, ChangeProfilePicture, getGeneraleData, getUserData } from "./user.actions";
import { User } from "./user.model";
import { Mapping } from "src/app/mobile/components/connexion/mapping.response";

@State<User>({
  name: 'user',
  defaults: new User
})
@Injectable()
export class UserState {
  @Selector()
  static type(state: User) { return state.type; }

  constructor(private store: Store, private http: HttpClient) { 
  }

  //....
  @Action(ChangeProfileType)
  changeProfileType(ctx: StateContext<User>, action: ChangeProfileType) {
    return ctx.patchState({type: action.type});
  }

  @Action(ChangeProfilePicture)
  changeProfilePicture(ctx: StateContext<User>, action: ChangeProfilePicture) {
    return ctx.patchState({imageUrl: action.src});
  }

  // Get User Data
  /*
   * Baptiste was here
   * 
   */
  @Action(getUserData)
  getUserData(ctx: StateContext<User>, action: getUserData) {
    let {token} = action
    let req = this.http.get(environment.backUrl + '/data/?action=getUserData',
    {
      headers: {
        "Authorization": `Token ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return req.pipe(
      tap((response: any)=> {
        let mapping = new Mapping(response);
        ctx.patchState({
          userData : mapping.userData,
          companyData: mapping.companyData
        })
      })
    )
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
};

@State({
  name:"generalData",
  defaults: {}
})
@Injectable()
export class GeneralData {

  constructor(private store: Store, private http: HttpClient) { }

  @Action(getGeneraleData)
  getGeneraleData(ctx: StateContext<any>, action: getGeneraleData) {
    let req = this.http.get(environment.backUrl + "/initialize/?action=getGeneralData",  {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return req.pipe(
      tap((response:any) => {
        ctx.setState({
          "JobValues": response['JobValues'],
          "LabelValues": response['LabelValues'],
          "RoleValues": response['RoleValues']
        })
      }) 
    )
  }

}
