import { ChangeDetectorRef, EventEmitter, Injectable } from "@angular/core";
import { Capacitor } from "@capacitor/core";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class Mobile {
  showFooter: boolean = true;

  footerStateSubject = new BehaviorSubject(true)
  footerState = this.footerStateSubject.asObservable()
    
  isInited: boolean = false
    

  constructor() {}
  init() {
    this.destroy()
    // this.footerStateSubject.next(false);
    if (Capacitor.getPlatform() !== "web" && !this.isInited) {
      // Keyboard.setAccessoryBarVisible({ isVisible: true });
      Keyboard.addListener("keyboardWillShow", (info: any) => {
        
        this.footerStateSubject.next(false);
      });
      Keyboard.addListener("keyboardDidHide", () => {
        this.footerStateSubject.next(true);
      });
    }
    // if(!this.isInited) this.test()
    this.isInited = true
  }

  get plateform() {
    return Capacitor.getPlatform()
  }
  test(){
    setInterval(()=>{
      this.test1()
      setTimeout(()=>{
            this.test2()

        },1000)
    },2000)
  }

  test1() {
    this.footerStateSubject.next(true);
  }
  test2() {
    this.footerStateSubject.next(false);
  }

  destroy() {
    if (Capacitor.getPlatform() !== "web") {
      Keyboard.removeAllListeners();
    }
  }

  hide() {
    Keyboard.hide()
  }
}
