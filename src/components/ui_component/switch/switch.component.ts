import { Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";

@Component({
  selector: 'switch',
  template: `
    <label class="switch">
      <input type="checkbox"/>
      <div class="slider" [class.round]="round"></div>
    </label>
`,
  styleUrls: [ './switch.component.scss' ]
})
export class UISwitchComponent {
  @Input()
  readonly round: boolean = true;

  @Input()
  value: boolean = false;

  @Output()
  valueChange = new EventEmitter<boolean>();
};