import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from 'src/components/landing_page/landing-page.component';
import { RegisterComponent } from 'src/components/register/register.component';
import { ConnexionComponent } from 'src/components/connexion/connexion.component';
import { emailConfirmation } from 'src/components/validator/email_confirmation/emailconfirmation';
import { RegistrationSuccess } from 'src/components/validator/registration_success/registrationsuccess';
const routes: Routes = [{
    path: 'landing',
    component: LandingPageComponent,
    data: { animation: 'LandingPage' }
  }, {
    path: 'connexion',
    component: ConnexionComponent
  }, {
    path: 'register',
    component: RegisterComponent
  }, {
    path: 'confirmed',
    component: emailConfirmation,
    data: { animation: 'Confirmed' }
  }, {
    path: 'success',
    component: RegistrationSuccess,
    data: { animation: 'Success' }
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
