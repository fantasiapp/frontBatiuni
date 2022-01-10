import { Injectable } from "@angular/core";
import { Device, DeviceInfo } from "@capacitor/device";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { from } from "rxjs";
import { tap } from "rxjs/operators";
import { AuthModel } from "src/models/auth/auth.model";
import { AuthState } from "src/models/auth/auth.state";
import { DataState } from "src/models/data/data.state";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";
import { Load } from "./app.actions";
import { AppModel } from "./app.model";

@State<AppModel>({
  name: 'app',
  defaults: {
    device: null
  },
  children: [AuthState, UserState, DataState]
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

  @Selector([DataState])
  static generalData(state: object) {
    return state;
  }

  @Selector([UserState])
  static userState(state: User) {
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