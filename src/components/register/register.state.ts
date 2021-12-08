import { Injectable } from "@angular/core";
import { Action, State, StateContext } from "@ngxs/store";
import { Update } from "./register.actions";
import { RegistrationModel } from "./register.model";

@State<RegistrationModel>({
  name: 'register',
  defaults: null
})
@Injectable()
export class RegistrationState {
  
  @Action(Update)
  update(ctx: StateContext<RegistrationModel>, action: Update) {
    ctx.setState(action.model);
    return true;
  }
};