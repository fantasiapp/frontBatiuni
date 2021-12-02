import { ChangeDetectionStrategy, Component, ElementRef } from "@angular/core";

@Component({
  selector: 'landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent {
  private _index: number = 0;
  private _scroll: number = 0;

  get index() { return this._index; }
  set index(val) {
    this._index = val;
    this.ref.nativeElement.scrollLeft = this.ref.nativeElement.offsetWidth * val;
  }

  constructor(private ref: ElementRef) {} 
};