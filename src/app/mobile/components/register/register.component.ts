import { ChangeDetectionStrategy, Component, HostListener, ViewChild } from "@angular/core";
import { RegisterForm } from "src/app/shared/forms/register.form";

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  @ViewChild(RegisterForm, {static: true})
  form!: RegisterForm;

  @HostListener('swipeleft')
  onSwipeLeft() {
    this.form.onNavigate(1);
  }

  @HostListener('swiperight')
  onSwipeRight() {
    this.form.onNavigate(-1);
  }
};