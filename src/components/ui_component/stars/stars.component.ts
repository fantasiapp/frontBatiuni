import { Component, HostBinding, Input } from "@angular/core";

export const ratingStarWidth = 25;

@Component({
  selector: 'stars',
  template: `
    <span [style.background-image]="this.fullStarUrl" [style.width]="spanWidth"></span>
  `,
  styleUrls: ['./stars.component.scss']
})
export class UIStarsComponent {
  @HostBinding('style.background-image')
  get emptyStarUrl() {
    return `url(assets/starEmpty.svg)`;
  }

  get spanWidth() {
    return (this._value * ratingStarWidth) + 'px';
  } 

  get fullStarUrl() {
    return `url(assets/starFull.svg)`;
  }

  private _value: number = 0;
  get value() { return this._value; }
  
  @Input()
  set value(val: number | string) {
    val = Math.min(5, Math.max(0, +val));
    this._value = val;
  }


}