import { Component } from "@angular/core";

@Component({
  selector: 'make_ad',
  templateUrl: './make_ad.component.html',
  styleUrls: ['./make_ad.component.scss']
})
export class MakeAdComponent {
  imports = {
    currencies: ['$', '€', '£']
  }
};