import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "src/app/mobile/routing/auth/auth.guard";
import { AuthResolver } from "src/app/mobile/routing/auth/auth.resolver";
import { EmailConfirmation } from "src/app/shared/validators/email_confirmation/emailconfirmation.component";
import { RegistrationSuccess } from "src/app/shared/validators/registration_success/registrationsuccess.component";
import { AnnoncePage } from "../components/annonce_page/annonce.page";
import { HomePageComponent } from "../components/home_page/home.page";
import { LandingPageComponent } from "../components/landing_page/landing.page";
import { MainPageComponent } from "../components/main/main.page";
import { ProfilePageComponent } from "../components/profile/profile.page";
import { RegisterPageComponent } from "../components/register/register.page";

const routes: Routes =[{
    path: 'landing',
    component: LandingPageComponent
  }, {
    path: 'register',
    component: RegisterPageComponent
  },{
    path: 'sos',
    component: RegisterPageComponent
  }, {
    path: 'confirmed/:token',
    component: EmailConfirmation 
  }, {
    path: 'success',
    component: RegistrationSuccess
  },{
    path: 'make',
    component: AnnoncePage
  }, {
    path: 'home',
    component: MainPageComponent,
    canActivate: [AuthGuard],
    resolve: [AuthResolver],
    children: [
      {path: 'profile', component: ProfilePageComponent, data: { animation: 'profile' }},
      {path: 'sos', component: SOSPageComponent},
      {path: '', pathMatch: 'full', component: HomePageComponent, data: { animation: 'home' } },
      {path: '**', component: HomePageComponent}
    ]
  }, {
    path: '**',
    redirectTo: 'landing'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, AuthResolver]
})
export class AppRoutingModule {}