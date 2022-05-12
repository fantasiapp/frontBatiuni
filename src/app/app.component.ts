import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Destroy$ } from "./shared/common/classes";
import { SplashScreen } from "@capacitor/splash-screen";
import { Load } from "./app.actions";
import { RouterOutlet } from "@angular/router";
import { transition, trigger } from "@angular/animations";
import {
  SlideChildrenLeft,
  SlideChildrenRight,
} from "src/animations/slide.animation";
import { AsyncSubject, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { GetGeneralData, GetUserData } from "src/models/new/user/user.actions";
import { Mobile } from "./shared/services/mobile-footer.service";
import { AuthState } from "src/models/auth/auth.state";
import { catchError } from "rxjs/operators";
import { Logout } from "src/models/auth/auth.actions";
import { delay } from "./shared/common/functions";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("routeAnimation", [
      transition(
        "LandingPage => *, * => Confirmed, * => Success, * => Register",
        SlideChildrenRight
      ),
      transition(
        "* => LandingPage, Confirmed => *, Success => *",
        SlideChildrenLeft
      ),
    ]),
  ],
})
export class AppComponent extends Destroy$ {
  constructor(private store: Store, private mobile: Mobile) {
    super();
    this.mobile.init();
  }

  ready$ = new AsyncSubject<true>();
  readyToUpdate: boolean = false;

  async ngOnInit() {
    await this.store.dispatch(new Load()).toPromise();
    await SplashScreen.hide();
    this.updateUserData();
    try {
      await this.store.dispatch(new GetGeneralData()).toPromise();
    } catch (e) {
      if (!environment.production) alert("GetGeneralData: 505 Error");
    }

    this.ready$.next(true);
    this.ready$.complete();
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.["animation"];
  }

  async updateUserData() {
    while (false) {
      console.log(
        "changeReadyToUpdate",
        this.changeReadyToUpdate(false),
        this.readyToUpdate
      );
      if (this.readyToUpdate) {
        console.log("getUserData", this.getUserData());
        await delay(5000);
      }
      await delay(5000);
    }
  }

  getUserData() {
    let token = this.store.selectSnapshot(AuthState.token);

    if (!token) return throwError("no token");

    return this.store.dispatch(new GetUserData(token!)).pipe(
      catchError(() => {
        this.store.dispatch(new Logout());
        return throwError("GetUserData Failed.");
      })
    );
  }

  changeReadyToUpdate(bool?: boolean) {
    if (bool !== null) {
      this.readyToUpdate = bool!;
      console.log(
        "changeReadyToUpdate",
        "bool :",
        bool,
        "readyToUpdate",
        this.readyToUpdate
      );
    } else {
      this.readyToUpdate = !this.readyToUpdate;
    }
  }

  // mobileInit(){
  //   if (Capacitor.getPlatform() !== "web") {
  //     Keyboard.setAccessoryBarVisible({isVisible: true})
  //   }
  // }
}
