import { ChangeDetectionStrategy, Component, HostBinding } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'make_ad',
  templateUrl: './make_ad.component.html',
  styleUrls: ['./make_ad.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MakeAdComponent {
  @HostBinding('class.page')
  isPage: boolean;

  goBack() { window.history.back() }

  imports = {
    currencies: ['$', '€', '£']
  }

  constructor(route: ActivatedRoute) {
    this.isPage = route.snapshot.url[0].path == 'make';
  }
};