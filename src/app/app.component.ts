import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { Destroy$ } from '../common/classes';
import { SplashScreen } from '@capacitor/splash-screen';
import { Load } from './app.actions';
import { RouterOutlet } from '@angular/router';
import { transition, trigger } from '@angular/animations';
import { SlideChildrenLeft, SlideChildrenRight } from 'src/animations/slide.animation';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('routeAnimation', [
      transition('* => LandingPage, * => Confirmed, * => Success', SlideChildrenLeft),
      transition('LandingPage => *, Confirmed => *, Success => *', SlideChildrenRight)
    ])
  ]
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

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}