import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { ChangePassword, ChangeProfilePicture, ChangeProfileType } from "./user.actions";
import { User } from "./user.model";

@State<User>({
  name: 'user',
  defaults: new User
})
@Injectable()
export class UserState {
  @Selector()
  static type(state: User) { return state.type; }

  constructor(private http: HttpClient) { }

  //....
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
    return '';
  }
};