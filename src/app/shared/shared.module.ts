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
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SlidesDirective } from "./directives/slides.directive";
import { EmailConfirmation } from "./validators/email_confirmation/emailconfirmation.component";
import { RegistrationSuccess } from "./validators/registration_success/registrationsuccess.component";
import { ModifyPasswordForm } from "./forms/ModifyPassword.form";
import { ImageGenerator } from "./services/image-generator.service";
import { OfferComponent } from "./components/offer/offer.component";
import { NavigationMenu } from "./components/navigation/navigation.component";
import { ModifyProfileForm } from "./forms/ModifyProfile.form";
import { ProfileResume } from "./components/profile-resume/profile-resume.component";
import { FileIcon } from "./components/FileIcon/file.icon";
import { UISOSCard } from "./components/SOSCard/SOSCard.ui";
import { UISOSCardMap } from "./components/SOSCardMap/SOSCardMap.ui";
import { UIBlockedContactCard } from "./components/BlockedContactCard/BlockedContactCard.ui";
import { InfoHandler } from "./components/info/info.component";
import { ConnexionForm } from "./forms/connexion.form";
import { CalendarUI } from "./components/calendar/calendar.ui";
import { HorizontaleCalendar } from "./components/horizontalcalendar/horizontal.component";
import { UISuggestionBox } from "./components/suggestionbox/suggestionbox.component";
import { ControlErrorsDirective, ErrorMessageComponent } from "./common/formerrors";
import { SpacingPipe } from "./pipes/spacing.pipe";
import { UIPopup } from "./components/popup/popup.component";
import { UIHSteps } from "./components/horizontal-steps/hsteps.ui";
import { Notifications } from "./components/notifications/notifications";
import { UIRadioboxAccessor, UIRadioboxComponent } from "./components/box/radiobox.component";
import { DocusignPage } from "./components/docusign_page/docusign.page";
import { ForgotPasswordForm } from "./forms/forgot.password";
import { MailForm } from "./forms/only.mail";
import { UISwipeupComponent } from "./components/swipeup/swipeup.component";
import { UISlideMenuComponent } from "./components/slidemenu/slidemenu.component";
import { UITooltipComponent } from "./components/tooltip/tooltip.component";
import { ProfileCardComponent } from "./components/profile-card/profile.card";
import { CastPipe, SnapshotPipe } from "./pipes/cast.pipe";
import { SpreadPipe } from "./pipes/spread.pipe";
import { ExtendedProfileComponent } from "./components/extended-profile/extended-profile.component";
import { SuiviComments } from "./components/suivi/comment.suivi";
import { SlideTemplate } from "./directives/slideTemplate.directive";
import { FileDownloader } from "./services/file-downloader.service";
import { UIAccordion } from "./components/accordion/accordion.ui";
import { UIComment } from "./components/comment/comment.ui";
import { FilterService } from "./services/filter.service";
import { MissionFilterForm } from "./forms/missions.form";
import { FileViewer } from "./components/file-viewer/file-viewer.component";
import { BannerComponent } from './components/banner/banner.component';
import { RatingComponent } from "./components/rating/rating.component";
import { SlideProfileComponent } from './components/slide-profile/slide-profile.component';
import { Mobile } from "./services/mobile-footer.service";
import { NotificationAgendaComponent } from './components/notification-agenda/notification-agenda.component';
import { ApplicationForm } from "./forms/application.form";

@NgModule({
  declarations: [
    UICheckboxComponent,
    UIRadioboxComponent,
    UIRadioboxAccessor,
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
    ApplicationForm,
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
    UISOSCardMap,
    UIBlockedContactCard,
    InfoHandler,
    CalendarUI,
    HorizontaleCalendar,
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
    UITooltipComponent,
    ProfileCardComponent,
    CastPipe,
    SpreadPipe,
    SnapshotPipe,
    ExtendedProfileComponent,
    SuiviComments,
    SlideTemplate,
    //FadeTemplate,
    //ScrollTemplate,
    UIAccordion,
    UIComment,
    MissionFilterForm,
    FileViewer,
    BannerComponent,
    RatingComponent,
    SlideProfileComponent,
    NotificationAgendaComponent,
  ],
  imports: [
    CommonModule,
    NgxSliderModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  exports: [
    OptionsModel,
    MakeAdForm,
    ApplicationForm,
    STFilterForm,
    PMEFilterForm,
    SOSFilterForm,
    OnlineFilterForm,
    UICheckboxComponent,
    UIRadioboxComponent,
    UIRadioboxAccessor,
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
    UISOSCardMap,
    UIBlockedContactCard,
    CalendarUI,
    InfoHandler,
    HorizontaleCalendar,
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
    UITooltipComponent,
    ProfileCardComponent,
    CastPipe,
    SpreadPipe,
    SnapshotPipe,
    ExtendedProfileComponent,
    SuiviComments,
    SlideTemplate,
    //FadeTemplate,
    //ScrollTemplate,
    UIAccordion,
    UIComment,
    MissionFilterForm,
    FileViewer,
    RatingComponent,
    SlideProfileComponent,
  ],
  providers: [ImageGenerator, FileDownloader, FilterService, Mobile]
})
export class SharedModule {}