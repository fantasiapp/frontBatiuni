import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UIDefaultAccessor } from "src/app/shared/common/classes";

@Component({
  selector: 'checkbox',
  template: `
    <input type="checkbox" (input)="onChange($event)" [checked]="value || null" tabindex="-1"/>
    <span></span>
  `,
  styleUrls: ['./box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: UICheckboxComponent
  }]
})
export class UICheckboxComponent extends UIDefaultAccessor<boolean> {
  constructor() {
    super();
    this.value = false;
  }

  getInput(e: Event) {
    let target = e.target as HTMLInputElement;
    return target.checked;
  }
};