import { Injectable } from "@angular/core";
import { Device, DeviceInfo } from "@capacitor/device";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { from } from "rxjs";
import { tap } from "rxjs/operators";
import { AuthModel } from "src/auth/auth.model";
import { AuthState } from "src/auth/auth.state";
import { RegistrationState } from "src/components/register/register.state";
import { Load } from "./app.actions";
import { AppModel } from "./app.model";

@State<AppModel>({
  name: 'app',
  defaults: {
    device: null
  },
  children: [AuthState, RegistrationState]
})
@Injectable()
export class AppState {
  @Selector([AuthState])
  static auth(state: AuthModel) {
    return state;
  }

  @Selector([AppState])
  static device(state: AppModel) {
    return state.device;
  }

  @Selector([RegistrationState])
  static registration(state: RegistrationState) {
    return state;
  }

  @Action(Load)
  onLoad(ctx: StateContext<AppModel>, action: Load) {
    return from(Device.getInfo()).pipe(
      tap((device: DeviceInfo) => {
        ctx.patchState({device})
      })
    );
  }
};