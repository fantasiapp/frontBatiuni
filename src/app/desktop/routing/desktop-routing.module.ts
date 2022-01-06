import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LandingPageComponent } from "../components/landing_page/landing.page";
import { RegisterPageComponent } from "../components/register/register.page";

const routes: Routes =[{
    path: 'landing',
    component: LandingPageComponent
  }, {
    path: 'register',
    component: RegisterPageComponent
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