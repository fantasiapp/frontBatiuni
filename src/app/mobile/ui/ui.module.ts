import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationMenu } from './navigation/navigation.component';
import { CalendarUI } from './calendar/calendar.ui';
import { UISwipeupComponent } from './swipeup/swipeup.component';
import { UISlideMenuComponent } from './slidemenu/slidemenu.component';
import { HorizantaleCalendar } from './horizantalecalendar/horizantale.component';
import { SuiviComments } from './suivi/comment.suivi';
import { UICreditCard } from './creditcard/credit-card.ui';
import { UIPopup } from './popup/popup.component';
import { UIAbonnement } from './abonnementUI/abonnement.ui';
import { HeaderComponent } from './header/header.component';
import { UISOSCard } from './SOSCard/SOSCard.ui';
import { UIAnnonceResume } from './annonce-resume/annonce-resume.ui';
import { CommentaireUI } from './commentaire/commentaire.ui';
import { FactureUI } from './factureUI/facture.ui';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    NavigationMenu,
    CalendarUI,
    UISwipeupComponent,
    UISlideMenuComponent,
    HorizantaleCalendar,
    SuiviComments,
    UICreditCard,
    UIPopup,
    UIAbonnement,
    HeaderComponent,
    UISOSCard,
    UIAnnonceResume,
    CommentaireUI,
    FactureUI,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    NavigationMenu,
    CalendarUI,
    UISwipeupComponent,
    UISlideMenuComponent,
    HorizantaleCalendar,
    SuiviComments,
    UICreditCard,
    UIPopup,
    UIAbonnement,
    HeaderComponent,
    UISOSCard,
    UIAnnonceResume,
    CommentaireUI,
    FactureUI
  ]
})
export class UIModule { }
