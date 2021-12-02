import { Injectable } from "@angular/core";
import { Selector, State } from "@ngxs/store";
import { AuthModel } from "src/auth/auth.model";
import { AuthState } from "src/auth/auth.state";
import { AppModel } from "./app.model";

@State<AppModel>({
  name: 'app',
  defaults: {},
  children: [AuthState]
})
@Injectable()
export class AppState {
  @Selector([AuthState])
  static auth(state: AuthModel) {
    return state;
  }
};