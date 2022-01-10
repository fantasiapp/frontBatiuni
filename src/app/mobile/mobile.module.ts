import { CommonModule } from "@angular/common";
import { Injectable, NgModule } from "@angular/core";
import { AbonnementPage } from "./components/abonnement/abonnement.page";
import { EngagementPage } from "./components/abonnement/engagement/engagement";
import { AnnoncePage } from "./components/annonce/annonce.page";
import { AnnonceEnlignePage } from "./components/annonce_enligne/annonce.enligne";
import { AvailabilitiesComponent } from "./components/availabilities_page/availabilities.component";
import { BoosterPage } from "./components/booster/booster.page";
import { ConnexionComponent } from "./components/connexion/connexion.component";
import { DiscoverComponent } from "./components/discover_page/discover-page.component";
import { FacturePage } from "./components/factures/facture.page";
import { HomeComponent } from "./components/home_page/home.component";
import { LandingPageComponent } from "./components/landing_page/landing-page.component";
import { MainPage } from "./components/main/main.component";
import { MakeAdComponent } from "./components/make_ad/make_ad.component";
import { MissionsComponent } from "./components/missions_page/missions.component";
import { Notifications } from "./components/notifications/notifications";
import { PagingComponent } from "./components/paging/paging.component";
import { ProfileComponent } from "./components/profile/profile.component";
import { RegisterComponent } from "./components/register/register.component";
import { SOSPageComponent } from "./components/SOS_page/sos-page.component";
import { SuiviPage } from "./components/suivi_page/suivi.page";
import { SuiviPME } from "./components/suivi_pme/suivi_pme.page";
import { FadeTemplate } from "./directives/fadeTemplate.directive";
import { SlideTemplate } from "./directives/slideTemplate.directive";
import { ScrollTemplate } from "./directives/scrollTemplate.directive";
import { UIModule } from "./ui/ui.module";
import { SharedModule } from "../shared/shared.module";
import { ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from "./routing/mobile-routing.module";


@NgModule({
  declarations: [
    LandingPageComponent,
    ConnexionComponent,
    RegisterComponent,
    DiscoverComponent,
    PagingComponent,
    SlideTemplate,
    FadeTemplate,
    ScrollTemplate,
    MainPage,
    ProfileComponent,
    Notifications,
    MissionsComponent,
    HomeComponent,
    AvailabilitiesComponent,
    MakeAdComponent,
    AnnoncePage,
    AbonnementPage,
    FacturePage,
    SOSPageComponent,
    EngagementPage,
    BoosterPage,
    SuiviPage,
    AnnonceEnlignePage,
    SuiviPME
  ],
  imports: [
    CommonModule,
    SharedModule,
    UIModule,
    AppRoutingModule,
    ReactiveFormsModule,
  ]
})
export class MobileModule {}