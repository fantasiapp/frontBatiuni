import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { Destroy$ } from '../common/classes';
import { SplashScreen } from '@capacitor/splash-screen';
import { Load } from './app.actions';
import { AppState } from './app.state';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent extends Destroy$ {
  constructor(private store: Store) {
    super();
    (window as any).app = this;
  }

  async ngOnInit() {
    await this.store.dispatch(new Load()).toPromise();
    await SplashScreen.hide();
  }
}