import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'landing',
  templateUrl: 'landing.page.html',
  styleUrls: ['./landing.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent {
  constructor() {

  }
};