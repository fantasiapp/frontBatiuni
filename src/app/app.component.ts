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
import { waitForAsync } from "@angular/core/testing";
import { NotifService } from "./shared/services/notif.service";
import { getMessaging, getToken, onMessage} from "firebase/messaging"
import { initializeApp } from "firebase/app";
import { BooleanService } from "./shared/services/boolean.service";
import { StripeService } from "./shared/services/stripe";
import { InfoService } from "./shared/components/info/info.component";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { LocalService } from "./shared/services/local.service";
import { App } from "@capacitor/app"

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

  title = 'af-notification'
  message : any = null
  isConnected: boolean = false;
  isWhileOn: boolean = false;
  app: any

  constructor(private store: Store, private mobile: Mobile, private notifService: NotifService, private booleanService: BooleanService, private stripeService: StripeService, private localService: LocalService, private info: InfoService) {
    super();
    this.isConnected = booleanService.isConnected
    this.booleanService.getConnectedChangeEmitter().subscribe((value) => {
      this.isConnected = value
      if(value && !this.isWhileOn){
        this.updateUserData()
      }
      this.isWhileOn = value
    })
    // this.updateUserData()
  }

  ready$ = new AsyncSubject<true>();
  readyToUpdate: boolean = true;
  firstAttemptAlreadyTried: boolean = false; 

  async ngOnInit() {
    await this.store.dispatch(new Load()).toPromise();
    await SplashScreen.hide();
    this.executeGetGeneralData()
    this.ready$.next(true);
    this.ready$.complete();
    this.app = initializeApp(environment.firebase)
    this.requestPermission()
    // this.listen()

    // this.mobile.init();

  }

  ngAfterViewInit(){

  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.["animation"];
  }

  async updateUserData() {
    while(this.isConnected) {
      if (this.readyToUpdate){
        this.readyToUpdate = false
        // console.log("dans le while", this.isWhileOn, "et suis-je connect?? ? ", this.isConnected)
      if (!this.firstAttemptAlreadyTried){
        this.executeGetGeneralData() 
        this.firstAttemptAlreadyTried = true
      }
      else{
        this.getUserData()
        this.notifService.emitNotifChangeEvent()
      }}
      this.readyToUpdate = true
      await delay(10000)
      
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
    if (bool !== undefined) {
      this.readyToUpdate = bool!;
    } else {
      this.readyToUpdate = !this.readyToUpdate;
    }
  }

  async executeGetGeneralData() {
    try {
      await this.store.dispatch(new GetGeneralData()).toPromise();
    } catch (e) {
      if (!environment.production) alert("GetGeneralData: 505 Error");
    }
  }

  async requestPermission() {
    if(Capacitor.getPlatform() === 'web'){
      console.log('GET PLATFORM MESSAGE : WEB');
      const messaging: any = getMessaging(this.app)
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js").then((registration) => {
          getToken(messaging, {vapidKey : environment.firebase.vapidKey, serviceWorkerRegistration: registration}).then((currentToken) => {
            if (currentToken) {
              this.notifService.setToken(currentToken)
              console.log("we got the token", currentToken, "and sent it to ", this.notifService)
            }
            else {console.log('No registration token available. Request permission to generate one.')}
          }).catch((err) => {
            console.log('An error occurred while retrieving token. ', err)
          })
        }).catch((err)=>{
        })
      }
    } else {
      console.log('GET PLATFORM MESSAGE : NOT WEB');

      await PushNotifications.addListener('registration', token => {
        console.info('Registration token: ', token.value, token);

        this.notifService.setToken(token.value)

        console.log('SET TOKEN', token.value);
      });

      await PushNotifications.addListener('registrationError', err => {
        console.error('Registration error: ', err.error);
      });

      await PushNotifications.addListener('pushNotificationReceived', notification => {
        console.log('Push notification received: ', notification);
      });

      await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
      });


      const registerNotifications = async () => {
        PushNotifications.checkPermissions().then(async (s)=> {
        console.log('REQUEST NOTIFICICATION', s.receive);
          if(s.receive === 'prompt'){
            const permStatus = await PushNotifications.requestPermissions()
              s = permStatus
          } 

          if(s.receive === 'granted'){
            console.log('NOTIFICATION REGISTER');
            await PushNotifications.register()
          }
        })
      }

      await registerNotifications()
    }


  }

  listen() {
    const messaging = getMessaging(this.app)
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload)
      this.message = payload
    })
  }

  // mobileInit(){
  //   if (Capacitor.getPlatform() !== "web") {
  //     Keyboard.setAccessoryBarVisible({isVisible: true})
  //   }
  // }

  ngOnDestroy(): void {
  }

  initBackGroundTask(){
    App.addListener("appStateChange", (isActive) => {
      if(!isActive){
        this.localService.dumpLocalStorage()
      }
    })
  }
}
