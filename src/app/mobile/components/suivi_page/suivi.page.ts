import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Location } from "@angular/common";

@Component({
  selector: "suivi-page",
  templateUrl: "suivi.page.html",
  styleUrls: ['suivi.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuiviPage {
  dates = [
    {date: '13/11/2021', /* .... */},
    {date: '14/11/2021', /* .... */},
    {date: '15/11/2021', /* .... */},
    {date: '16/11/2021', /* .... */},
    {date: '17/11/2021', /* .... */},
    {date: '18/11/2021', /* .... */},
    {date: '19/11/2021', /* .... */},
    {date: '20/11/2021', /* .... */}
  ];

  constructor(private location: Location) {}

  back() { this.location.back(); }
}