import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, ViewChild } from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { footerTranslate } from "src/animations/footer.animation";
import { Destroy$ } from "src/app/shared/common/classes";
import { RegisterForm } from "src/app/shared/forms/register.form";
import { Mobile } from "src/app/shared/services/mobile-footer.service";

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: footerTranslate
})
export class RegisterComponent extends Destroy${
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
    super()
  }

  ngOnInit(){
    this.mobile.init()
    this.mobile.footerState.pipe(takeUntil(this.destroy$)).subscribe(b => {
      this.showFooter = b
      this.cd.detectChanges()
    })
  }
};