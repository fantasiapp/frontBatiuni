import { animate, state, style, transition, trigger } from "@angular/animations";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, ViewChild } from "@angular/core";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { Observable } from "rxjs";
import { RegisterForm } from "src/app/shared/forms/register.form";

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('showFooter', [
      state('false', style({
        transform: 'translateY(100%)'
      })),
      state('true', style({
        transform: 'translateY(0%)'
      })),
      transition('* <=> *', [animate('0.2s')])
    ])
  ]
})
export class RegisterComponent {
  @ViewChild(RegisterForm, {static: true})
  form!: RegisterForm;
  showFooter: boolean = true;
  

  @HostListener('swipeleft')
  onSwipeLeft() {
    this.form.onNavigate(1);
  }

  @HostListener('swiperight')
  onSwipeRight() {
    this.form.onNavigate(-1);
  }

  @ViewChild('footer') footer!: HTMLElement;

  constructor(private cd: ChangeDetectorRef){
    this.mobileInit()
  }

  ngAfterViewInit() {
    
  }

  mobileInit(){
    if (Capacitor.getPlatform() !== "web") {
      Keyboard.setAccessoryBarVisible({isVisible: true})
      Keyboard.addListener('keyboardWillShow', (info: any) => {
        this.showFooter = false
        this.cd.detectChanges()
      });
      Keyboard.addListener('keyboardDidHide', () => {
        console.log('keyboard did hide');
        this.showFooter = true;
        this.cd.detectChanges()
      });
    }
  }

  ngOnDestroy() {
    if (Capacitor.getPlatform() !== "web") {
      Keyboard.removeAllListeners()
    }
  }
};