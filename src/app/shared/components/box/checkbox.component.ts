import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
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
  constructor(cd: ChangeDetectorRef) {
    super(cd);
    this._value = false;
  }


  onChange(e: Event) {
    this.valueChange.emit(this.value = !this.value);
    this.cd.markForCheck()
  }

  getInput(e: Event) {
    let target = e.target as HTMLInputElement;
    return target.checked;
  }
};