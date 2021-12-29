import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'sos-page',
  templateUrl: './sos-page.component.html',
  styleUrls: ['./sos-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SOSPageComponent {
  activeView: number = 0;
  openSOSFilterMenu: boolean = false;

  availableAgents = new Array(10).fill(0);
};