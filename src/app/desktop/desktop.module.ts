import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { HammerModule } from "@angular/platform-browser";
import { LandingPageComponent } from "./components/landing_page/landing.page";
import { SharedModule } from "../shared/shared.module";
import { AppRoutingModule } from "./routing/desktop-routing.module";
import { RegisterPageComponent } from "./components/register/register.page";
import { EmailConfirmation } from "../shared/validators/email_confirmation/emailconfirmation.component";
import { HeaderDesktop } from "./components/header/header.desktop";

@NgModule({
  declarations: [
    LandingPageComponent,
    RegisterPageComponent,
    HeaderDesktop
  ],
  imports: [
    CommonModule,
    SharedModule,
    AppRoutingModule,
    HammerModule,
  ]
})
export class DesktopModule {}