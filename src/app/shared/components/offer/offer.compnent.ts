import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Input, Output} from "@angular/core";
import { Store } from "@ngxs/store";
import { Post, Company } from "src/models/new/data.interfaces";
import { DataQueries, Snapshot } from "src/models/new/data.state";
import { DeletePost } from "src/models/new/user/user.actions";

@Component({
  selector: 'offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferComponent { 

  constructor(private store: Store) {}

  @Input()
  src: string = "assets/confirmation.svg"

 
  

  


  @Input()
  deletable: boolean = false;

  company: Company | null = null;
  private _post!: Post | null;
  get post() { return this._post; }
  
  @Input() set post(p: Post | null) {
    this._post = p;
    this.company = p ? this.store.selectSnapshot(DataQueries.getById('Company', p.company)) : null;
  }

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
    e.stopPropagation();
    this.store.dispatch(new DeletePost(this.post!.id));
  }

  toLocateDate(date?: string) {
    return date ? new Date(date).toLocaleDateString('fr') : "(Non renseigné)";
  }
};
