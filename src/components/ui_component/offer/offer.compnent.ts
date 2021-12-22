import { ChangeDetectionStrategy, Component, Input} from "@angular/core";

@Component({
  selector: 'offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferComponent { 
  @Input()
  company : string = "Nom de l'entreprise";
  @Input()
  fourniture : string = "Fourniture et pose";
  @Input()
  adress : string = "Adresse du chantier";
  @Input()
  date : Date  = new Date('December 17, 1995 03:24:00')
  @Input()
  imgSrc : string = "assets/confirmation.svg"
};
