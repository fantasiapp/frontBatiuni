import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { HammerModule } from "@angular/platform-browser";
import { LandingPageComponent } from "./components/landing_page/landing.page";
import { SharedModule } from "../shared/shared.module";
import { AppRoutingModule } from "./routing/desktop-routing.module";
import { RegisterPageComponent } from "./components/register/register.page";
import { HeaderDesktop } from "./components/header/header.desktop";
import { HomePageComponent } from "./components/home_page/home.page";
import { StepUI } from "./ui/step/step.ui";
import { TabsComponent } from "./ui/tabs/tabs.component";
import { ProfilePageComponent } from "./components/profile/profile.page";
import { MainPageComponent } from "./components/main/main.page";
import { AnnoncePage } from "./components/annonce_page/annonce.page";
import { FactureUI } from "./ui/factureUI/facture.ui";
import { SosPageComponenet } from "./components/sos_page/sos.page";
import { UIAbonnement } from "./ui/abonnementUI/abonnement.ui";
import { ConnexionPageComponent } from "./components/connexion/connexion.page";
import { MissionPage } from "./components/missions/mission.page";
import { DispoPage } from "./components/availibity/dispo.page";
import { ForgotPasswordComponent } from "./components/forgot_password/forgot.password";
import { MailSender } from "./components/only_mail/only.mail";
import { AnnonceValidePage } from "./components/annonce_valider/annonce.valide";
import { SuiviComments } from "./ui/suivi/comment.suivi";
import { ReactiveFormsModule } from "@angular/forms";
import { ReponseCard } from "./ui/reponse-card/reponse-card";

@NgModule({
  declarations: [
    LandingPageComponent,
    RegisterPageComponent,
    HeaderDesktop,
    HomePageComponent,
    StepUI,
    TabsComponent,
    ProfilePageComponent,
    MainPageComponent,
    AnnoncePage,
    FactureUI,
    SosPageComponenet,
    UIAbonnement,
    ConnexionPageComponent,
    MissionPage,
    DispoPage,
    ForgotPasswordComponent,
    MailSender,
    AnnonceValidePage,
    SuiviComments,
    ReponseCard
  ],
  imports: [
    CommonModule,
    SharedModule,
    AppRoutingModule,
    HammerModule,
    ReactiveFormsModule,

  ]
})
export class DesktopModule {}