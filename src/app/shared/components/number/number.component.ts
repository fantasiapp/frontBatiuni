import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { UIDefaultAccessor } from "src/common/classes";

@Component({
  selector: 'number',
  template: `
    <img (click)="onChange(-1)" src="assets/icons/minus.svg"/>
    <input class="center-text" min="0" type="number" [value]="value" disabled/>
    <img (click)="onChange(1)" src="assets/icons/plus.svg"/>`,
  styleUrls: ['./number.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: UINumberComponent
  }]
})
export class UINumberComponent extends UIDefaultAccessor<number> {
  
  constructor() {
    super();
    this.value = this.min + (this.max + this.min) / 2;
  }
  
  @Input()
  min: number = 0;

  ngOnInit() { }

  @Input()
  max: number = Infinity;

  @Output()
  valueChange = new EventEmitter<number>();

  protected getInput(k: number) {
    return Math.min(this.max, Math.max(this.min, this.value! + k));
  }
};