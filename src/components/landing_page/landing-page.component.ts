import { ChangeDetectionStrategy, Component, HostListener, ViewChild } from "@angular/core";
import { SlidesDirective } from "src/directives/slides.directive";
import { LandingPageEntreprise } from "./entreprise/entreprise.component";
import { LandingPageSousTraitant } from "./sous-traitant/sous-traitant";

@Component({
  selector: 'landing-page',
  templateUrl: 'landing-page.component.html',
  styleUrls: ['landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent {
  slides = [LandingPageEntreprise, LandingPageSousTraitant];

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