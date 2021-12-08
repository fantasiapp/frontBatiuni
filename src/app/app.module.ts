import { environment } from 'src/environments/environment';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
import { LandingPageComponent } from 'src/components/landing_page/landing-page.component';
import { Entreprise as EntrepriseLandingPage } from 'src/components/landing_page/entreprise/entreprise.component';
import { SousTraitant as LandingPageSousTraitant } from 'src/components/landing_page/sous-traitant/sous-traitant';
import { ConnexionComponent } from 'src/components/connexion/connexion.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    EntrepriseLandingPage,
    LandingPageSousTraitant,
    ConnexionComponent
  ],
  imports: [
    //Ngxs imports
    NgxsModule.forRoot([
      AppState, AuthState
    ], {
      developmentMode: !environment.production
    }),
    NgxsStoragePluginModule.forRoot({
      key: ['auth.token']
    }),
    NgxsRouterPluginModule.forRoot(),
    //Angular normal imports
    CommonModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
