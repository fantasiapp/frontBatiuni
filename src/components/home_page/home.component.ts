import { Component, ChangeDetectionStrategy } from "@angular/core";
import { DistanceSliderConfig, SalarySliderConfig } from "src/common/config";

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  activeView: number = 0;
  annonces = new Array(10);

  openAdFilterMenu: boolean = false;

  imports = { DistanceSliderConfig, SalarySliderConfig };
};