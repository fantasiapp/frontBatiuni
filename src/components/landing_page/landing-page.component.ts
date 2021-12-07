import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'landing-page',
  template: '<router-outlet #outlet="outlet"></router-outlet>',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent {

};