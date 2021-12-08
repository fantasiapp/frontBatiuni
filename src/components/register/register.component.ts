import { Component, HostListener, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { SlidesDirective } from "src/directives/slides.directive";

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: [
    './register.component.scss'
  ]
})
export class RegisterComponent {
  registerForm = new FormGroup({
    lastname: new FormControl(''),
    firstname: new FormControl(''),
    email: new FormControl(''),
    emailVerifier: new FormControl(''),
    password: new FormControl(''),
    parrain: new FormControl(''),
    role: new FormControl(''),
    company: new FormControl(''),
    job: new FormControl('')
  });

  @ViewChild(SlidesDirective, {static: true})
  slidesContainer!: SlidesDirective;

  constructor() {
    (window as any).landing = this;
  }

  @HostListener('swiperight')
  onSwipeRight() {
    this.slidesContainer.right();
  }

  @HostListener('swipeleft')
  onSwipeLeft() {
    this.slidesContainer.left();
  }
};