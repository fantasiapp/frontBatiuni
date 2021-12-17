import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'number',
  template: `
    <img (click)="add(-1)" src="assets/icons/minus.svg"/>
    <input class="center-text" min="0" type="number" [value]="value"/>
    <img (click)="add(1)" src="assets/icons/plus.svg"/>`,
  styleUrls: ['./number.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UINumberComponent {
  @Input()
  value: number = 1;

  @Input()
  min: number = 0;

  @Input()
  max: number = Infinity;

  @Output()
  valueChange = new EventEmitter<number>();

  private clamp(n: number) {
    return Math.min(this.max, Math.max(this.min, n));
  }

  add(k: number) {
    let next = this.clamp(this.value + k);
    if ( this.value != next )
      this.valueChange.emit(this.value = next);
  }
};