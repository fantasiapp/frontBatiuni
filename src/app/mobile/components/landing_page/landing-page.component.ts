import { ChangeDetectionStrategy, Component, HostListener, ViewChild } from "@angular/core";
import { SlidesDirective } from "src/app/shared/directives/slides.directive";

@Component({
  selector: 'landing-page',
  templateUrl: 'landing-page.component.html',
  styleUrls: ['landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent {
  @ViewChild(SlidesDirective, {static: true})
  slider!: SlidesDirective;

  constructor() { }

  @HostListener('swiperight')
  onSwipeRight() {
    this.slider.right();
  }

  @HostListener('swipeleft')
  onSwipeLeft() {
    this.slider.left();
  }
};