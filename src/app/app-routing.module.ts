import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from 'src/components/landing_page/landing-page.component';
import { RegisterComponent } from 'src/components/register/register.component';
import { ConnexionComponent } from 'src/components/connexion/connexion.component';
import { emailConfirmation } from 'src/components/validator/email_confirmation/emailconfirmation';
import { RegistrationSuccess } from 'src/components/validator/registration_success/registrationsuccess';
import { DiscoverComponent } from 'src/components/discover_page/discover-page.component';
import { OptionsModel } from 'src/components/options/options';
import { HomeComponent } from 'src/components/home_page/home.component';
import { ProfileComponent } from 'src/components/profile/profile.component';
import { MissionsUI } from 'src/components/ui_component/missions/missions.ui';
import { Notifications } from 'src/components/notifications/notifications';
import { FileUI } from 'src/components/ui_component/filesUI/files.ui';

import { UISlideMenuComponent } from 'src/components/ui_component/slidemenu/slidemenu.component';
import { UINumberComponent } from 'src/components/ui_component/number/number.component';
import { MissionsPages } from 'src/components/missions/missions.component';
import { CalendarUI } from 'src/components/ui_component/calendar/calendar.ui';
import { HorizantaleCalendar } from 'src/components/ui_component/hori_calendar/hozirantal.calendar';
const routes: Routes = [{
    path: 'landing',
    component: HorizantaleCalendar,
    data: { animation: 'LandingPage' }
  }, {
    path: 'connexion',
    component: ConnexionComponent
  }, {
    path: 'discover',
    redirectTo: 'discover/entreprise'
  }, {
    path: 'discover/:subject',
    component: DiscoverComponent,
    data: { animation: 'Discover' }
  }, {
    path: 'register',
    component: RegisterComponent
  }, {
    path: 'confirmed',
    component: emailConfirmation,
    data: { animation: 'Confirmed' }
  }, {
    path: 'testmodel',
    component: OptionsModel
  }, {
    path: 'success',
    component: RegistrationSuccess,
    data: { animation: 'Success' }
  }, {
    path: 'home',
    component: HomeComponent,
    children: [
      {path: 'profile', component: ProfileComponent, data: { animation: 'profile' }},
      {path: '**', component: RegistrationSuccess}
    ]
  }, {
    path: '**',
    redirectTo: 'landing',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

/*
  <range min="10" max="10" unit="km"></range>
*/