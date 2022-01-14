import {  ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngxs/store";
import { interval, race } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/common/classes";
import { ConfirmAccount } from "src/models/auth/auth.actions";

@Component({
  selector: 'emailConfirmed',
  templateUrl: 'emailconfirmation.component.html',
  styleUrls: ['emailconfirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailConfirmation extends Destroy$ {
  confirmed: boolean = false;
  points: string = '.';

  constructor(private store: Store, private cd: ChangeDetectorRef, private route: ActivatedRoute) {
    super();
    const token = this.route.snapshot.params.token;

    const reply = this.store.dispatch(new ConfirmAccount(token));

    interval(500).pipe(takeUntil(race(
      this.destroy$, reply
    ))).subscribe(() =>  {
      this.points = this.points.length >= 5 ? '.' : this.points += '.'
      this.cd.markForCheck();
    }, err => {
      //....
    }, () => {
      this.confirmed = true;
      this.cd.markForCheck();
    });
  }
};