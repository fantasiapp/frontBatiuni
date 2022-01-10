import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EmailConfirmation } from "src/app/shared/validators/email_confirmation/emailconfirmation.component";
import { RegistrationSuccess } from "src/app/shared/validators/registration_success/registrationsuccess.component";
import { HeaderDesktop } from "../components/header/header.desktop";
import { LandingPageComponent } from "../components/landing_page/landing.page";
import { RegisterPageComponent } from "../components/register/register.page";

const routes: Routes =[{
    path: 'landing',
    component: HeaderDesktop
  }, {
    path: 'register',
    component: RegisterPageComponent
  }, {
    path: 'confirmed',
    component: EmailConfirmation 
  }, {
    path: 'success',
    component: RegistrationSuccess
  }, {
    path: '**',
    redirectTo: 'landing'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}