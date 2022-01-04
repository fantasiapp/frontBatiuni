import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

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

  isDraft: boolean;

  constructor(route: ActivatedRoute) {
    this.isDraft = route.snapshot.url[0].path == 'brouillon';
  }
};