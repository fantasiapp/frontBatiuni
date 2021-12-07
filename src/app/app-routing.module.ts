import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from 'src/components/landing-page.component';

const routes: Routes = [{
  path: 'landing', component: LandingPageComponent,
  children: [{
    path: 'sous-traitant',
    component: LandingPageComponent
  }, {
    path: 'entreprise',
    component: LandingPageComponent
  }]
  }, {
    path: '**',
    redirectTo: 'landing'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
