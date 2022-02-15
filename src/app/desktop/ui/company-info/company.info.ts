import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Profile } from 'src/models/new/data.interfaces';
import { QueryProfile } from 'src/models/new/data.state';

type annonceType = 'makead' | 'viewad';

@Component({
  selector: 'company-info',
  templateUrl: 'company.info.html',
  styleUrls: ['company.info.scss'],
})
export class CompanyInfo implements OnInit {
  constructor(private store: Store) { }

  @Input()
  type: annonceType = 'makead';

  headerText = this.type == 'makead' ? makead : viewad;
  
  @QueryProfile()
  @Input('profile')
  profile$!: number | Profile | Observable<Profile>;


  ngOnInit() { (this.profile$ as Observable<Profile>).subscribe(console.log) }
}

export const makead = ['N SIRET', 'Métier', "Chiffres d'affaires"];
export const viewad = ['Métier', 'Date', 'Montant'];
