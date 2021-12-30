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

  //mock variable, should be a part of our models later
  userType: boolean = true; //0 -> ST; 1 -> PME

  imports = { DistanceSliderConfig, SalarySliderConfig };
};