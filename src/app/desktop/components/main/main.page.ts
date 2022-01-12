import { transition, trigger } from "@angular/animations";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { FadeIn } from "src/animations/fade.animation";

@Component({
  selector: 'main-page',
  template: `
    <desktop-stickyH></desktop-stickyH>
    <div [@routeAnimation]="prepareRoute(outlet)" class="router">
      <router-outlet #outlet="outlet"></router-outlet>
    </div>
  `,
  styles: [`
    @import 'src/styles/variables';
    @import 'src/styles/mixins';
    
    :host {
      display: block;
      height: 100vh;
    }

    .router::ng-deep > * { width: 100vw; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('routeAnimation', [
      transition("* => *", FadeIn)
    ])
  ]
})
export class MainPageComponent {
  constructor() {

  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
};