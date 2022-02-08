import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { Destroy$ } from './shared/common/classes';
import { SplashScreen } from '@capacitor/splash-screen';
import { Load } from './app.actions';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { transition, trigger } from '@angular/animations';
import { SlideChildrenLeft, SlideChildrenRight } from 'src/animations/slide.animation';
import { AsyncSubject } from 'rxjs';
import { GetGeneralData } from 'src/models/data/data.actions';
import { environment } from 'src/environments/environment';
import { SlidemenuService } from './shared/components/slidemenu/slidemenu.component';
import { AnnoncePage } from './desktop/components/annonce_page/annonce.page';
import { UISwitchComponent } from './shared/components/switch/switch.component';
import { UITooltipService } from './shared/components/tooltip/tooltip.component';
import { takeUntil } from 'rxjs/operators';


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
  constructor(private store: Store, private router: Router) {
    super();
    (window as any).app = this;
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      // if ( event instanceof NavigationStart )
      // console.log(event)
    })
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