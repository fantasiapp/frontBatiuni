import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Profile } from 'src/models/new/data.interfaces';
import { QueryProfile } from 'src/models/new/data.state';

type annonceType = 'makead' | 'viewad';

@Component({
  selector: 'company-info',
  templateUrl: 'company.info.html',
  styleUrls: ['company.info.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyInfo implements OnInit {
  constructor(private store: Store) { }

  @Input()
  type: annonceType = 'makead';

  headerText!:string [];
  
  @QueryProfile()
  @Input('profile')
  profile$!: number | Profile | Observable<Profile>;

  date =  Date.now()

  ngOnInit() { this.headerText  = this.type == 'makead' ? makead : viewad; }
}

export const makead = ['N SIRET', 'Métier', "Chiffres d'affaires"];
export const viewad = ['Date', 'Date', 'Montant'];
