import {  ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngxs/store";

@Component({
  selector: 'emailConfirmed',
  templateUrl: 'emailconfirmation.component.html',
  styleUrls: ['emailconfirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailConfirmation {
  confirmed: boolean = false;

  constructor(private store: Store, private route: ActivatedRoute) {
    const token = this.route.snapshot.params.token;
  }
};