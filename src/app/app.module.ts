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
import { NgxSliderModule } from '@angular-slider/ngx-slider';

import { LandingPageComponent } from 'src/components/landing_page/landing-page.component';
import { SlidesDirective } from 'src/directives/slides.directive';
import { ConnexionComponent } from 'src/components/connexion/connexion.component';
import { RegisterComponent } from 'src/components/register/register.component';
import { emailConfirmation } from 'src/components/validator/email_confirmation/emailconfirmation';
import { RegistrationSuccess } from 'src/components/validator/registration_success/registrationsuccess';
import { DiscoverComponent } from 'src/components/discover_page/discover-page.component';
import { OptionsModel } from 'src/components/options/options';

import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { SlideTemplate } from 'src/directives/slideTemplate.directive';
import { PagingComponent } from 'src/components/paging/paging.component';
import { FadeTemplate } from 'src/directives/fadeTemplate.directive';
import { MainPage } from 'src/components/main/main.component';
import { ProfileComponent } from 'src/components/profile/profile.component';
import { Notifications } from 'src/components/notifications/notifications';
import { MissionsComponent } from 'src/components/missions_page/missions.component';
import { HomeComponent } from 'src/components/home_page/home.component';
import { AvailabilitiesComponent } from 'src/components/availabilities_page/availabilities.component';
import { MakeAdComponent } from 'src/components/make_ad/make_ad.component';
import { AnnoncePage } from 'src/components/annonce/annonce.page';
import { MakeAdForm } from 'src/components/forms/MakeAd.form';
import { STFilterForm } from 'src/components/forms/STFilter.form';
import { PMEFilterForm } from 'src/components/forms/PMEFilter.form';
import { AbonnementPage } from 'src/components/abonnement/abonnement.page';
import { FacturePage } from 'src/components/factures/facture.page';
import { SOSPageComponent } from 'src/components/SOS_page/sos-page.component';
import { SOSFilterForm } from 'src/components/forms/SOSFilter.form';
import { EngagementPage } from 'src/components/abonnement/engagement/engagement';
import { BoosterPage } from 'src/components/booster/booster.page';
import { UserState } from 'src/models/User/user.state';
import { UIModule } from './ui/ui.module';
import { AnnonceEnlignePage } from 'src/components/annonce_enligne/annonce.enligne';

@Injectable()
export class CustomConfig extends HammerGestureConfig {
  overrides: { [key: string]: Object; } = {
    'pinch': { enabled: false },
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
    DiscoverComponent,
    OptionsModel,
    PagingComponent,
    SlideTemplate,
    FadeTemplate,
    MainPage,
    ProfileComponent,
    Notifications,
    MissionsComponent,
    HomeComponent,
    AvailabilitiesComponent,
    MakeAdComponent,
    AnnoncePage,
    MakeAdForm,
    STFilterForm,
    PMEFilterForm,
    AbonnementPage,
    FacturePage,
    SOSPageComponent,
    SOSFilterForm,
    EngagementPage,
    BoosterPage,
    AnnonceEnlignePage
  ],
  imports: [
    //Ngxs imports
    NgxsModule.forRoot([
      AppState, AuthState, UserState
    ], {
      developmentMode: !environment.production
    }),
    NgxsStoragePluginModule.forRoot({
      key: ['app.auth.token', 'app.user']
    }),
    NgxsRouterPluginModule.forRoot(),
    //Google maps
    //3rd party
    NgxSliderModule,
    //Anng gular standard imports
    CommonModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HammerModule,
    ReactiveFormsModule,
    UIModule
  ],
  providers: [{
    provide: HAMMER_GESTURE_CONFIG,
    useClass: CustomConfig
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
