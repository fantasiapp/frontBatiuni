import { Component, OnInit, Input } from '@angular/core';

type annonceType = 'makead' | 'viewad';

@Component({
  selector: 'company-info',
  templateUrl: 'company.info.html',
  styleUrls: ['company.info.scss'],
})
export class CompanyInfo implements OnInit {
  constructor() {}

  @Input()
  type: annonceType = 'makead';

  headerText = this.type == 'makead' ? makead : viewad;

  ngOnInit() {}
}

export const makead = ['N SIRET', 'Métier', "Chiffres d'affaires"];
export const viewad = ['Métier', 'Date', 'Montant'];
