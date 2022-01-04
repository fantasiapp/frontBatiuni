import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { ChangeProfilePicture, ChangeProfileType } from "./user.actions";
import { User } from "./user.model";

@State<User>({
  name: 'user',
  defaults: new User
})
@Injectable()
export class UserState {
  @Selector()
  static type(state: User) { return state.type; }

  constructor() { }

  //....
  @Action(ChangeProfileType)
  changeProfileType(ctx: StateContext<User>, action: ChangeProfileType) {
    return ctx.patchState({type: action.type});
  }

  @Action(ChangeProfilePicture)
  changeProfilePicture(ctx: StateContext<User>, action: ChangeProfilePicture) {
    return ctx.patchState({imageUrl: action.src});
  }
};