import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: 'post',
  templateUrl: './make_ad.component.html',
  styleUrls: ['./make_ad.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MakeAdComponent {
  imports = {
    currencies: ['$', '€', '£']
  }

  @Input() page: boolean = true;
  @Input() withSubmit: boolean = false;
};