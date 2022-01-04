import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UIDefaultAccessor } from "src/common/classes";

@Component({
  selector: 'switch',
  template: `
    <span *ngIf="off" [class.active]="!this.value">{{off}}</span>
    <label class="switch">
      <input type="checkbox" (input)="onChange($event)" #input [checked]="value || null" [disabled]="isDisabled || null"/>
      <div class="slider" [class.round]="round"></div>
    </label>
    <span *ngIf="on" [class.active]="this.value">{{on}}</span>
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
  off = "";

  @Input()
  on = "";

  getInput(e: any) {
    let target = e.target as HTMLInputElement;
    return target.checked;
  }
};