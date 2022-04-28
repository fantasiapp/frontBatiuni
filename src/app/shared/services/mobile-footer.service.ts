import { ChangeDetectorRef, EventEmitter, Injectable } from "@angular/core";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class Mobile{
    showFooter: boolean = true;

    footerStateSubject = new BehaviorSubject(true)
    footerState = this.footerStateSubject.asObservable()
    
    constructor(){
    }
    init(){
        if (Capacitor.getPlatform() !== "web") {
            Keyboard.setAccessoryBarVisible({isVisible: true})
            Keyboard.addListener('keyboardWillShow', (info: any) => {
                this.footerStateSubject.next(false)
            });
                Keyboard.addListener('keyboardDidHide', () => {
                console.log('keyboard did hide');
                this.footerStateSubject.next(true)
            });
        }
    }

    test1(){
        this.footerStateSubject.next(true)
    }
    test2(){
        this.footerStateSubject.next(false)
    }
    
    destroy(){
        if (Capacitor.getPlatform() !== "web") {
            Keyboard.removeAllListeners()
        }
    }
} 