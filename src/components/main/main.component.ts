import { transition, trigger } from "@angular/animations";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { FadeIn } from "src/animations/fade.animation";

@Component({
  selector: 'main-page',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('routeAnimation', [
      transition("* => *", FadeIn)
    ])
  ]
})
export class MainPage {
  constructor() {

  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
};