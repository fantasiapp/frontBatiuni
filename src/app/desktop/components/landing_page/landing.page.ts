import { ChangeDetectionStrategy, Component } from "@angular/core";
import { main } from "src/models/data/mapper.model";

@Component({
  selector: 'landing',
  templateUrl: 'landing.page.html',
  styleUrls: ['./landing.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent {
  constructor() {
    main();
  }
};