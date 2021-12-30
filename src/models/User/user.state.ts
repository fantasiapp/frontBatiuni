import { Injectable } from "@angular/core";
import { Selector, State } from "@ngxs/store";
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
};