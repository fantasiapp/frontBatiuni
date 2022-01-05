import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationMenu } from './navigation/navigation.component';
import { OfferComponent } from './offer/offer.compnent';
import { CalendarUI } from './calendar/calendar.ui';
import { UISwipeupComponent } from './swipeup/swipeup.component';
import { UISwitchComponent } from './switch/switch.component';
import { UIStarsComponent } from './stars/stars.component';
import { UISlideMenuComponent } from './slidemenu/slidemenu.component';
import { UIProfileImageComponent } from './profile-image/profile-image.component';
import { FileUI } from './filesUI/files.ui';
import { UIBoxComponent } from './box/box.component';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { HorizantaleCalendar } from './horizantalecalendar/horizantale.component';
import { UiMapComponent } from './map/map.component';
import { SuiviComments } from './suivi/comment.suivi';
import { UICreditCard } from './creditcard/credit-card.ui';
import { UIPopup } from './popup/popup.component';
import { UIAbonnement } from './abonnementUI/abonnement.ui';
import { HeaderComponent } from './header/header.component';
import { UISOSCard } from './SOSCard/SOSCard.ui';
import { UIAnnonceResume } from './annonce-resume/annonce-resume.ui';
import { StarSysteme } from './starsysteme/star.systeme';
import { CommentaireUI } from './commentaire/commentaire.ui';
import { FactureUI } from './factureUI/facture.ui';
import { AppRoutingModule } from '../app-routing.module';
import { UINumberComponent } from './number/number.component';



@NgModule({
  declarations: [
    NavigationMenu,
    OfferComponent,
    CalendarUI,
    FileUI,
    UISwipeupComponent,
    UISwitchComponent,
    UIStarsComponent,
    UISlideMenuComponent,
    UIProfileImageComponent,
    UIBoxComponent,
    SearchbarComponent,
    HorizantaleCalendar,
    UiMapComponent,
    SuiviComments,
    UICreditCard,
    UIPopup,
    UIAbonnement,
    HeaderComponent,
    UISOSCard,
    UIAnnonceResume,
    StarSysteme,
    CommentaireUI,
    FactureUI,
    UINumberComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule
  ],
  exports: [
    NavigationMenu,
    OfferComponent,
    CalendarUI,
    FileUI,
    UISwipeupComponent,
    UISwitchComponent,
    UIStarsComponent,
    UISlideMenuComponent,
    UIProfileImageComponent,
    UIBoxComponent,
    SearchbarComponent,
    HorizantaleCalendar,
    UiMapComponent,
    SuiviComments,
    UICreditCard,
    UIPopup,
    UIAbonnement,
    HeaderComponent,
    UISOSCard,
    UIAnnonceResume,
    StarSysteme,
    CommentaireUI,
    FactureUI,
    UINumberComponent
  ]
})
export class UIModule { }
