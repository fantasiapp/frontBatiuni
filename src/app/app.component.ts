import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Directive, SimpleChanges } from '@angular/core';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { takeUntil } from 'rxjs/operators';
import { Destroy$ } from '../common/classes';
import { Login, Logout } from 'src/auth/auth.actions';
import { Navigate } from '@ngxs/router-plugin';


const tabs = [
  {title: 'Page 1', body: 'Hello page 1'},
  {title: 'Page 2', body: 'Hello page 2'},
  {title: 'Page 3', body: 'Hello page 3'},
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends Destroy$ {
  constructor(private store: Store, private actions$: Actions, private cd: ChangeDetectorRef) {
    super();
  }

  tabs = tabs;

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

  addTab(e: MouseEvent) {
    let controls = (e.target as unknown as HTMLElement).parentElement!;
    let title = (controls.children[0] as HTMLInputElement).value,
      body = (controls.children[2] as HTMLTextAreaElement).value;
    
    this.tabs = [...this.tabs, {title, body}];
    this.cd.markForCheck();
  }
}