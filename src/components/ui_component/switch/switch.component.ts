import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UIDefaultAccessor } from "src/common/classes";

@Component({
  selector: 'switch',
  template: `
    <span [class.active]="!this.value">{{off}}</span>
    <label class="switch">
      <input type="checkbox" (input)="onChange($event)" #input/>
      <div class="slider" [class.round]="round"></div>
    </label>
    <span [class.active]="this.value">{{on}}</span>
`,
  styleUrls: [ './switch.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: UISwitchComponent
  }]
})
export class UISwitchComponent extends UIDefaultAccessor<boolean> {
  @Input()
  readonly round: boolean = true;

  @Input()
  off = "Profil ST";

  @Input()
  on = "Profile PME";

  getInput(e: any) {
    let target = e.target as HTMLInputElement;
    return target.checked;
  }
};