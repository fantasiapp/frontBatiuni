import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { AbonnementPage } from "./components/abonnement/abonnement.page";
import { EngagementPage } from "./components/abonnement/engagement/engagement";
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
import { PagingComponent } from "./components/paging/paging.component";
import { ProfileComponent } from "./components/profile/profile.component";
import { RegisterComponent } from "./components/register/register.component";
import { SOSPageComponent } from "./components/SOS_page/sos-page.component";
import { SuiviPME } from "./components/suivi_pme/suivi-pme.page";
import { SuiviChantierDate } from "./components/suivi_chantier_date/suivi_chantier_date.page";
import { UIModule } from "./ui/ui.module";
import { SharedModule } from "../shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from "./routing/mobile-routing.module";
import { ForgotPassword } from "./components/forgot_password/forgot.password";
import { MailSender } from "./components/only_mail/only.mail";
import { ApplicationsComponent } from "./components/applications/applications.component";
import { InviteFriendsComponent } from "./components/invite_friends/invite_friends.component";
import { SuiviChantierDateContentComponent } from './components/suivi_chantier_date-content/suivi_chantier_date-content.component';

@NgModule({
  declarations: [
    LandingPageComponent,
    ConnexionComponent,
    RegisterComponent,
    DiscoverComponent,
    PagingComponent,
    MainPage,
    ProfileComponent,
    MissionsComponent,
    HomeComponent,
    AvailabilitiesComponent,
    MakeAdComponent,
    AbonnementPage,
    FacturePage,
    SOSPageComponent,
    EngagementPage,
    BoosterPage,
    SuiviPME,
    SuiviChantierDate,
    ForgotPassword,
    MailSender,
    ApplicationsComponent,
    InviteFriendsComponent,
    SuiviChantierDateContentComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    UIModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class MobileModule {}