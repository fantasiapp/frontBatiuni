import { environment } from 'src/environments/environment';
import { Injectable, NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AuthState } from 'src/auth/auth.state';
import { HttpClientModule } from '@angular/common/http';
import { AppState } from './app.state';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { LandingPageComponent } from 'src/components/landing_page/landing-page.component';
import { SlidesDirective } from 'src/directives/slides.directive';
import { ConnexionComponent } from 'src/components/connexion/connexion.component';
import { RegisterComponent } from 'src/components/register/register.component';
import { emailConfirmation } from 'src/components/validator/email_confirmation/emailconfirmation';
import { RegistrationSuccess } from 'src/components/validator/registration_success/registrationsuccess';
import { SliderComponent } from 'src/components/slider/slider.component';
import { DiscoverComponent } from 'src/components/discover_page/discover-page.component';
import { OptionsModel } from 'src/components/options/options';
import { GoogleMapsModule } from '@angular/google-maps';
import { RangeComponent } from 'src/components/ui_component/range/range.component';
import { OfferComponent } from 'src/components/ui_component/offer/offer.compnent';
import { HomeMenu } from 'src/components/ui_component/homeMenu/home.menu';

import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { TabComponent, TabsComponent } from 'src/components/tabs/tabs.component';
import { SlideTemplate } from 'src/directives/slideTemplate.directive';
import { PagingComponent } from 'src/components/paging/paging.component';

@Injectable()
export class CustomConfig extends HammerGestureConfig {
  overrides: { [key: string]: Object; } = {
    'rotate': { enable: false },
    'swipe': { enable: true, direction: Hammer.DIRECTION_HORIZONTAL },
  };
}

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    ConnexionComponent,
    RegisterComponent,
    emailConfirmation,
    RegistrationSuccess,
    SlidesDirective,
    SliderComponent,
    DiscoverComponent,
    OptionsModel,
    TabComponent,
    TabsComponent,
    RangeComponent,
    OfferComponent,
    SlideTemplate,
    PagingComponent
  ],
  imports: [
    //Ngxs imports
    NgxsModule.forRoot([
      AppState, AuthState
    ], {
      developmentMode: !environment.production
    }),
    NgxsStoragePluginModule.forRoot({
      key: ['auth.token', 'register']
    }),
    NgxsRouterPluginModule.forRoot(),
    //Angular normal imports
    CommonModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HammerModule,
    ReactiveFormsModule,
    GoogleMapsModule
  ],
  providers: [{
    provide: HAMMER_GESTURE_CONFIG,
    useClass: CustomConfig
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
