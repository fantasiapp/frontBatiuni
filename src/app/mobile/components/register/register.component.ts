import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, ViewChild } from "@angular/core";
import { footerTranslate } from "src/animations/footer.animation";
import { RegisterForm } from "src/app/shared/forms/register.form";
import { Mobile } from "src/app/shared/services/mobile-footer.service";

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: footerTranslate
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

  constructor(private cd: ChangeDetectorRef, public mobile: Mobile){
  }

  ngOnInit(){
    this.mobile.init()
    this.mobile.footerState.subscribe(b => {
      this.showFooter = b
      console.log('fsgdg');
      this.cd.detectChanges()
    })
  }
};