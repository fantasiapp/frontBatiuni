import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Destroy$ } from './shared/common/classes';
import { SplashScreen } from '@capacitor/splash-screen';
import { Load } from './app.actions';
import { RouterOutlet } from '@angular/router';
import { transition, trigger } from '@angular/animations';
import { SlideChildrenLeft, SlideChildrenRight } from 'src/animations/slide.animation';
import { AsyncSubject, Observable } from 'rxjs';
import { GetGeneralData } from 'src/models/data/data.actions';
import { environment } from 'src/environments/environment';
import { DataModel, DataState } from 'src/models/new/data.state';
import { Company } from 'src/models/new/data.interfaces';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('routeAnimation', [
      transition('LandingPage => *, * => Confirmed, * => Success, * => Register', SlideChildrenRight),
      transition('* => LandingPage, Confirmed => *, Success => *', SlideChildrenLeft)
    ])
  ]
})
export class AppComponent extends Destroy$ {
  constructor(private store: Store) {
    super();
  }

  ready$ = new AsyncSubject<true>();

  async ngOnInit() {
    await this.store.dispatch(new Load()).toPromise();
    await SplashScreen.hide();
    try {
      await this.store.dispatch(new GetGeneralData()).toPromise();
    } catch (e) {
      if ( !environment.production )
        alert('GetGeneralData: 505 Error');
    }

    this.ready$.next(true);
    this.ready$.complete();
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}