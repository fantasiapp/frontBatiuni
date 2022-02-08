import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from '../components/landing_page/landing-page.component';
import { RegisterComponent } from '../components/register/register.component';
import { ConnexionComponent } from '../components/connexion/connexion.component';
import { DiscoverComponent } from '../components/discover_page/discover-page.component';
import { MainPage } from '../components/main/main.component';
import { ProfileComponent } from '../components/profile/profile.component';
import { MissionsComponent } from '../components/missions_page/missions.component';
import { HomeComponent } from '../components/home_page/home.component';
import { AvailabilitiesComponent } from '../components/availabilities_page/availabilities.component';

import { AbonnementPage } from '../components/abonnement/abonnement.page';
import { FacturePage } from '../components/factures/facture.page';
import { EngagementPage } from '../components/abonnement/engagement/engagement';
import { MakeAdComponent } from '../components/make_ad/make_ad.component';
import { SOSPageComponent } from '../components/SOS_page/sos-page.component';
import { BoosterPage } from '../components/booster/booster.page';
import { SuiviPage } from '../components/suivi_page/suivi.page';
import { SuiviPME } from '../components/suivi_pme/suivi_pme.page';
import { AuthGuard } from './auth/auth.guard';

import { EmailConfirmation } from 'src/app/shared/validators/email_confirmation/emailconfirmation.component';
import { RegistrationSuccess } from 'src/app/shared/validators/registration_success/registrationsuccess.component';
import { AuthResolver } from './auth/auth.resolver';
import { DocusignPage } from 'src/app/shared/components/docusign_page/docusign.page';
import { ForgotPassword } from '../components/forgot_password/forgot.password';
import { MailSender } from '../components/only_mail/only.mail';
import { ResponsePage } from '../components/response/reponse.page';

const routes: Routes = [{
    path: 'landing',
    component: LandingPageComponent,
    canActivate: [AuthGuard],
    data: { animation: 'LandingPage' }
  }, {
    path: 'connexion',
    component: ConnexionComponent,
    canActivate: [AuthGuard],
  }, {
    path: 'forgot_password/:token',
    component: ForgotPassword,
    // canActivate: [AuthGuard],
  }, {
    path: 'mail',
    component: MailSender,
    // canActivate: [AuthGuard],
  },  {
    path: 'discover',
    redirectTo: 'discover/entreprise'
  }, {
    path: 'discover/:subject',
    component: DiscoverComponent,
    canActivate: [AuthGuard],
    data: { animation: 'Discover' }
  }, {
    path: 'register',
    component: RegisterComponent,
    data: { animation: 'Register' }
  }, {
    path: 'confirmed/:token',
    component: EmailConfirmation,
    data: { animation: 'Confirmed' }
  }, {
    path: 'success',
    component: RegistrationSuccess,
    data: { animation: 'Success' }
  }, {
    path: 'abonnement',
    component: AbonnementPage,
  }, {
    path: 'engagement',
    component: EngagementPage,
  },{
    path:'docusign',component:DocusignPage
  } , {
    path: 'booster',
    component: BoosterPage
  }, {
    path: 'annonce-validee',
    component: SuiviPME
  },{
    path: 'suivi',
    component: SuiviPage
  }, {
    path: 'factures',
    component: FacturePage,
  },{
    path: 'reponse',
    component: ResponsePage,
  }, {
    path: 'home',
    component: MainPage,
    canActivate: [AuthGuard],
    resolve: [AuthResolver],
    children: [
      {path: 'profile', component: ProfileComponent, data: { animation: 'profile' }},
      {path: 'missions', component: MissionsComponent, data: { animation: 'missions' }},
      {path: 'availabilities', component: AvailabilitiesComponent, data: { animation: 'availabilities' }},      {path: 'sos', component: SOSPageComponent, data: { animation: 'sos' } },
      {path: 'make', component: MakeAdComponent, data: { animation: 'make'} },
      {path: 'make/:id', component: MakeAdComponent, data: { animation: 'make'} },
      {path: '', pathMatch: 'full', component: HomeComponent, data: { animation: 'home' } },
      {path: '**', component: HomeComponent}
    ]
  }, {
    path: '**',
    redirectTo: 'landing',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, AuthResolver]
})
export class AppRoutingModule { }