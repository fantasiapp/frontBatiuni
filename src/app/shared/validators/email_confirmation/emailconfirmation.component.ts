import {  ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'emailConfirmed',
  templateUrl: 'emailconfirmation.component.html',
  styleUrls: ['emailconfirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailConfirmation {
  constructor() { }
};