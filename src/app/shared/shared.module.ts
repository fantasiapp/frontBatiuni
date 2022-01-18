import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MakeAdForm } from "./forms/MakeAd.form";
import { OnlineFilterForm } from "./forms/OnlineFilter.form";
import { PMEFilterForm } from "./forms/PMEFilter.form";
import { SOSFilterForm } from "./forms/SOSFilter.form";
import { STFilterForm } from "./forms/STFilter.form";
import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { OptionsModel } from "./components/options/options";
import { UIBoxComponent } from "./components/box/box.component";
import { UiMapComponent } from "./components/map/map.component";
import { UINumberComponent } from "./components/number/number.component";
import { UIProfileImageComponent } from "./components/profile-image/profile-image.component";
import { SearchbarComponent } from "./components/searchbar/searchbar.component";
import { StarSysteme } from "./components/starsysteme/star.systeme";
import { UIStarsComponent } from "./components/stars/stars.component";
import { UISwitchComponent } from "./components/switch/switch.component";
import { FileUI } from "./components/filesUI/files.ui";
import { RegisterForm } from "./forms/register.form";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { SlidesDirective } from "./directives/slides.directive";
import { EmailConfirmation } from "./validators/email_confirmation/emailconfirmation.component";
import { RegistrationSuccess } from "./validators/registration_success/registrationsuccess.component";
import { ModifyPasswordForm } from "./forms/ModifyPassword.form";
import { ImageGenerator } from "./services/image-generator.service";
import { OfferComponent } from "./components/offer/offer.compnent";
import { NavigationMenu } from "./components/navigation/navigation.component";
import { ModifyProfileForm } from "./forms/ModifyProfile.form";
import { ProfileResume } from "./components/profile-resume/profile-resume.component";
import { FileIcon } from "./components/FileIcon/file.icon";
import { UISOSCard } from "./components/SOSCard/SOSCard.ui";

@NgModule({
  declarations: [
    UIBoxComponent,
    UiMapComponent,
    UINumberComponent,
    OptionsModel,
    UIProfileImageComponent,
    SearchbarComponent,
    UIStarsComponent,
    StarSysteme,
    UISwitchComponent,
    FileUI,
    MakeAdForm,
    STFilterForm,
    PMEFilterForm,
    SOSFilterForm,
    OnlineFilterForm,
    RegisterForm,
    SlidesDirective,
    EmailConfirmation,
    RegistrationSuccess,
    ModifyPasswordForm,
    OfferComponent,
    NavigationMenu,
    ModifyProfileForm,
    ProfileResume,
    FileIcon,
    UISOSCard,
  ],
  imports: [
    CommonModule,
    NgxSliderModule,
    RouterModule,
    ReactiveFormsModule
  ],
  exports: [
    OptionsModel,
    MakeAdForm,
    STFilterForm,
    PMEFilterForm,
    SOSFilterForm,
    OnlineFilterForm,
    UIBoxComponent,
    UiMapComponent,
    UINumberComponent,
    OptionsModel,
    UIProfileImageComponent,
    SearchbarComponent,
    UIStarsComponent,
    StarSysteme,
    UISwitchComponent,
    FileUI,
    RegisterForm,
    SlidesDirective,
    EmailConfirmation,
    RegistrationSuccess,
    ModifyPasswordForm,
    OfferComponent,
    NavigationMenu,
    ModifyProfileForm,
    ProfileResume,
    FileIcon,
    UISOSCard
  ],
  providers: [ImageGenerator]
})
export class SharedModule {}