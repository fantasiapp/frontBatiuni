import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Input} from "@angular/core";
import { PostRow } from "src/models/data/data.model";
import { Serialized } from "../../common/types";

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
  deletable: boolean = false;

  @Input() post!: Serialized<PostRow>;

  @HostBinding("class.delete")
  delete: boolean = false;

  @HostBinding("style.overflow")
  overflow = "hidden";

  @HostListener("transitionend")
  onTransitionEnd() {
    if (!this.delete) this.overflow = "hidden";
  }

  showDeleteButton() {
    this.delete = this.deletable && !this.delete
    if ( this.delete ) this.overflow = 'visible';
  }

  hideDeleteButton() {
    this.delete = false;
  }

  deletePost(e: Event) {
    console.log('deleting', this.post);
    e.stopPropagation();
  }
};
