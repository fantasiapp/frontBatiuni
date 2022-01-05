import { ChangeDetectionStrategy, Component, HostListener, ViewChild } from "@angular/core";
import { SlidesDirective } from "../../directives/slides.directive";

@Component({
  selector: 'landing-page',
  templateUrl: 'landing-page.component.html',
  styleUrls: ['landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent {
  @ViewChild(SlidesDirective, {static: true})
  slidesContainer!: SlidesDirective;

  constructor() { }

  @HostListener('swiperight')
  onSwipeRight() {
    this.slidesContainer.right();
  }

  @HostListener('swipeleft')
  onSwipeLeft() {
    this.slidesContainer.left();
  }
};