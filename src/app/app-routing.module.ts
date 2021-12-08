import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from 'src/components/landing_page/landing-page.component';
import { Entreprise as LandingPageEntreprise } from 'src/components/landing_page/entreprise/entreprise.component';
import { SousTraitant as LandingPageSousTraitant } from 'src/components/landing_page/sous-traitant/sous-traitant';
import { ConnexionComponent } from 'src/components/connexion/connexion.component';


const routes: Routes = [{
    path: 'landing',
    component: LandingPageComponent,
  }, {
    path: 'connexion',
    component: ConnexionComponent
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
