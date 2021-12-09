import { environment } from 'src/environments/environment';
import { NgModule } from '@angular/core';
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
<<<<<<< HEAD
import { LandingPageEntreprise } from 'src/components/landing_page/entreprise/entreprise.component';
import { LandingPageSousTraitant } from 'src/components/landing_page/sous-traitant/sous-traitant';
import { emailConfirmation } from 'src/components/validator/email_confirmation/emailconfirmation';
import { RegistrationSuccess } from 'src/components/validator/registration_success/registrationsuccess';
=======
import { SliderComponent } from 'src/components/slider/slider.component';

>>>>>>> de39ae25f552d653e9fd1c78bf821f19b913e0d0
@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    ConnexionComponent,
    RegisterComponent,
<<<<<<< HEAD
    LandingPageEntreprise,
    LandingPageSousTraitant,
    emailConfirmation,
    RegistrationSuccess,
    SlidesDirective
=======
    SlidesDirective,
    SliderComponent,
>>>>>>> de39ae25f552d653e9fd1c78bf821f19b913e0d0
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
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
