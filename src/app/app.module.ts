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
import { DiscoverComponent } from 'src/components/discover_page/discover-page.component';
import { OptionsModel } from 'src/components/options/options';
import { GoogleMapsModule } from '@angular/google-maps';
import { OfferComponent } from 'src/components/ui_component/offer/offer.compnent';
import { NavigationMenu } from 'src/components/ui_component/navigation/navigation.component';

import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { TabComponent, TabsComponent } from 'src/components/tabs/tabs.component';
import { SlideTemplate } from 'src/directives/slideTemplate.directive';
import { PagingComponent } from 'src/components/paging/paging.component';
import { FadeTemplate } from 'src/directives/fadeTemplate.directive';
import { CalendarUI } from 'src/components/ui_component/calendar/calendar.ui';
import { HomeComponent } from 'src/components/home_page/home.component';
import { ProfileComponent } from 'src/components/profile/profile.component';
import { UISwitchComponent } from 'src/components/ui_component/switch/switch.component';
import { UISwipeupComponent } from 'src/components/ui_component/swipeup/swipeup.component';
import { MissionsUI } from 'src/components/ui_component/missions/missions.ui';
import { Notifications } from 'src/components/notifications/notifications';
import { UIStarsComponent } from 'src/components/ui_component/stars/stars.component';
import { UISlideMenuComponent } from 'src/components/ui_component/slidemenu/slidemenu.component';
import { UIProfileImageComponent } from 'src/components/ui_component/profile-image/profile-image.component';
import { UINumberComponent } from 'src/components/ui_component/number/number.component';
import { FileUI } from 'src/components/ui_component/filesUI/files.ui';
import { MissionsPages } from 'src/components/missions/missions.component';

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
    TabComponent,
    TabsComponent,
    OfferComponent,
    PagingComponent,
    SlideTemplate,
    FadeTemplate,
    CalendarUI,
    HomeComponent,
    NavigationMenu,
    ProfileComponent,
    UISwitchComponent,
    UISwipeupComponent,
    MissionsUI,
    Notifications,
    UIStarsComponent,
    UISlideMenuComponent,
    UIProfileImageComponent,
    UINumberComponent,
    FileUI,
    MissionsPages
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
    GoogleMapsModule,
    NgxSliderModule
  ],
  providers: [{
    provide: HAMMER_GESTURE_CONFIG,
    useClass: CustomConfig
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
