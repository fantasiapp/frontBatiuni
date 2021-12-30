import { Injectable } from "@angular/core";
import { Selector, State } from "@ngxs/store";
import { User } from "./user.model";

@State<User | null>({
  name: 'user',
  defaults: null
})
@Injectable()
export class UserState {
  @Selector()
  static type(state: User | null): string | null { return state ? state.type : null; }

  constructor() { }

  //....
};