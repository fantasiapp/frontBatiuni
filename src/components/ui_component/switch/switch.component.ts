import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";

@Component({
  selector: 'switch',
  template: `
    <span [class.active]="!this.value">{{off}}</span>
    <label class="switch">
      <input type="checkbox" (change)="this.value = input.checked" #input/>
      <div class="slider" [class.round]="round"></div>
    </label>
    <span [class.active]="this.value">{{on}}</span>
`,
  styleUrls: [ './switch.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UISwitchComponent {
  @Input()
  readonly round: boolean = true;

  @Input()
  off = "Profil ST";

  @Input()
  on = "Profile PME";

  @Input()
  value: boolean = false;

  @Output()
  valueChange = new EventEmitter<boolean>();
};