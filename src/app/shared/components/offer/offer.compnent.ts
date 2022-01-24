import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Input} from "@angular/core";

@Component({
  selector: 'offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferComponent { 
  @Input()
  company: string = "Nom de l'entreprise";
  @Input()
  fourniture: string = "Fourniture et pose";
  @Input()
  address: string = "Adresse du chantier";
  @Input()
  date: string  = 'December 17, 1995 03:24:00'
  @Input()
  src: string = "assets/confirmation.svg"
  @Input()
  brouillon: boolean = false;

  @HostBinding("class.delete")
  delete: boolean = false;

  @HostBinding("style.overflow")
  overflow = "hidden";

  @HostListener("transitionend")
  onTransitionEnd() {
    if (!this.delete) this.overflow = "hidden";
  }

  showDeleteButton() {
    this.delete = this.brouillon && !this.delete
    if ( this.delete ) this.overflow = 'visible';
  }

};
