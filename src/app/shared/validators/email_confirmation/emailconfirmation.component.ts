import {  ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MyStore } from "src/app/shared/common/classes";
import { interval, race } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { ConfirmAccount } from "src/models/auth/auth.actions";

@Component({
  selector: 'email-confirmed',
  templateUrl: 'emailconfirmation.component.html',
  styleUrls: ['emailconfirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailConfirmation extends Destroy$ {
  confirmed: boolean = false;
  content = 'Confirmation en cours';
  points: string = '.';

  constructor(private store: MyStore, private cd: ChangeDetectorRef, private route: ActivatedRoute) {
    super();
    const token = this.route.snapshot.params.token;
    const reply = this.store.dispatch(new ConfirmAccount(token));


    interval(500).pipe(takeUntil(race(
      this.destroy$, reply
    ))).subscribe((resp) =>  {
      this.points = this.points.length >= 5 ? '.' : this.points += '.'
      this.cd.markForCheck();
    }, err => {
      this.content = 'Echec en raison de:';
      this.points = 'Token invalide.'; //err
      this.cd.markForCheck()
      //....
    }, () => {
      this.confirmed = true;
      this.cd.markForCheck();
    });
  }
};