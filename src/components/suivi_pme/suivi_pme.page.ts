import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "suivi_pme",
  templateUrl:"suivi_pme.page.html",
  styleUrls:['suivi_pme.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuiviPME {

 swipemenu: boolean = false;
 dates = [
    {date: '13/11/2021', /* .... */},
    {date: '14/11/2021', /* .... */},
    {date: '15/11/2021', /* .... */},
    {date: '16/11/2021', /* .... */},
    {date: '17/11/2021', /* .... */},
    {date: '18/11/2021', /* .... */},
    {date: '19/11/2021', /* .... */},
    {date: '20/11/2021', /* .... */}
  ]
}