import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from "@angular/core";

@Component({
  selector: "annonce-page",
  templateUrl: "annonce.page.html",
  styleUrls: ['annonce.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnoncePage {
  currency: string = '€';

  onCurrencyChange(e: Event) {
    this.currency = (e.target as HTMLInputElement).value;
  }
}