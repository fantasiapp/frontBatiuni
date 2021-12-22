import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { UIDefaultAccessor } from "src/common/classes";

@Component({
  selector: 'box',
  template: `
    <input [type]="type" [name]="name" (input)="onChange($event)" [checked]="value || null"/>
    <span></span>
  `,
  styleUrls: ['./box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: UIBoxComponent
  }]
})
export class UIBoxComponent extends UIDefaultAccessor<boolean> {
  @Input()
  type: "checkbox" | "radio" = "checkbox";

  @Input()
  name: string | null = null;

  constructor() {
    super();
    this.value = false;
  }

  getInput(e: Event) {
    console.log('yeah!!');
    let target = e.target as HTMLInputElement;
    return target.checked;
  }
};