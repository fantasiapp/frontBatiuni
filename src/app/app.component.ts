import { Component } from '@angular/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
//import { RouterDataResolved } from '@ngxs/router-plugin';
import { takeUntil } from 'rxjs/operators';
import { Destroy$ } from '../common/classes';
import { Login, Logout } from 'src/auth/auth.actions';
import { Navigate } from '@ngxs/router-plugin';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends Destroy$ {
  constructor(private store: Store, private actions$: Actions) {
    super();
  }

  ngOnInit() {
    this.actions$.pipe(
      ofActionSuccessful(Logout),
      takeUntil(this.destroy$)
    ).subscribe((action: Logout) => {
      this.store.dispatch(new Navigate(['/']));
    });
  }

  login() {
    this.store.dispatch(new Login("vivian", "pwd"));
  }

  logout() {
    this.store.dispatch(new Logout());
  }
}
