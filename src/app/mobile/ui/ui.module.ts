import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UISwipeupComponent } from './swipeup/swipeup.component';
import { UISlideMenuComponent } from './slidemenu/slidemenu.component';
import { SuiviComments } from './suivi/comment.suivi';
import { UICreditCard } from './creditcard/credit-card.ui';
import { UIAbonnement } from './abonnementUI/abonnement.ui';
import { HeaderComponent } from './header/header.component';
import { UIAnnonceResume } from './annonce-resume/annonce-resume.ui';
import { CommentaireUI } from './commentaire/commentaire.ui';
import { FactureUI } from './factureUI/facture.ui';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    UISwipeupComponent,
    UISlideMenuComponent,
    SuiviComments,
    UICreditCard,
    UIAbonnement,
    HeaderComponent,
    UIAnnonceResume,
    CommentaireUI,
    FactureUI
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,

  ],
  exports: [
    UISwipeupComponent,
    UISlideMenuComponent,
    SuiviComments,
    UICreditCard,
    UIAbonnement,
    HeaderComponent,
    UIAnnonceResume,
    CommentaireUI,
    FactureUI
  ]
})
export class UIModule { }
