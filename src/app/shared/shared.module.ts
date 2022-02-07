import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MakeAdForm } from "./forms/MakeAd.form";
import { OnlineFilterForm } from "./forms/OnlineFilter.form";
import { PMEFilterForm } from "./forms/PMEFilter.form";
import { SOSFilterForm } from "./forms/SOSFilter.form";
import { STFilterForm } from "./forms/STFilter.form";
import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { OptionsModel } from "./components/options/options";
import { UICheckboxComponent } from "./components/box/checkbox.component";
import { UIMapComponent } from "./components/map/map.component";
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
import { InfoHandler, InfoService } from "./components/info/info.component";
import { ConnexionForm } from "./forms/connexion.form";
import { CalendarUI } from "./components/calendar/calendar.ui";
import { HorizantaleCalendar } from "./components/horizantalecalendar/horizantale.component";
import { UISuggestionBox } from "./components/suggestionbox/suggestionbox.component";
import { ControlErrorsDirective, ErrorMessageComponent } from "./common/formerrors";
import { SpacingPipe } from "./pipes/spacing.pipe";
import { UIPopup } from "./components/popup/popup.component";
import { UIHSteps } from "./components/horizontal-steps/hsteps.ui";
import { Notifications } from "./components/notifications/notifications";
import { UIRadioAccessor, UIRadioboxComponent } from "./components/box/radiobox.component";
import { DocusignPage } from "./components/docusign_page/docusign.page";
import { ForgotPasswordForm } from "./forms/forgot.password";
import { MailForm } from "./forms/only.mail";
import { UISwipeupComponent } from "./components/swipeup/swipeup.component";
import { UISlideMenuComponent } from "./components/slidemenu/slidemenu.component";
import { UITooltipComponent } from "./components/tooltip/tooltip.component";

@NgModule({
  declarations: [
    UICheckboxComponent,
    UIRadioboxComponent,
    UIRadioAccessor,
    UIMapComponent,
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
    ConnexionForm,
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
    InfoHandler,
    CalendarUI,
    HorizantaleCalendar,
    UISuggestionBox,
    ErrorMessageComponent,
    ControlErrorsDirective,
    SpacingPipe,
    UIPopup,
    UIHSteps,
    Notifications,
    DocusignPage,
    ForgotPasswordForm,
    MailForm,
    UISwipeupComponent,
    UISlideMenuComponent,
    UITooltipComponent
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
    UICheckboxComponent,
    UIRadioboxComponent,
    UIRadioAccessor,
    UIMapComponent,
    UINumberComponent,
    OptionsModel,
    UIProfileImageComponent,
    SearchbarComponent,
    UIStarsComponent,
    StarSysteme,
    UISwitchComponent,
    FileUI,
    RegisterForm,
    ConnexionForm,
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
    CalendarUI,
    InfoHandler,
    HorizantaleCalendar,
    UISuggestionBox,
    ErrorMessageComponent,
    ControlErrorsDirective,
    SpacingPipe,
    UIPopup,
    UIHSteps,
    Notifications,
    UIHSteps,
    DocusignPage,
    ForgotPasswordForm,
    MailForm,
    UISwipeupComponent,
    UISlideMenuComponent,
    UITooltipComponent
  ],
  providers: [ImageGenerator]
})
export class SharedModule {}