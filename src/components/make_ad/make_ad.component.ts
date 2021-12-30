import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'make_ad',
  templateUrl: './make_ad.component.html',
  styleUrls: ['./make_ad.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MakeAdComponent {

  goBack() { window.history.back() }

  imports = {
    currencies: ['$', '€', '£']
  }
};