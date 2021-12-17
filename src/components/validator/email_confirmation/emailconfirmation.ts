import {  ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'emailConfirmed',
  templateUrl: 'emailconfirmation.component.html',
  styleUrls: ['emailconfirmed.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class emailConfirmation {
  constructor() { }
};