import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Input} from "@angular/core";
import { Store } from "@ngxs/store";
import { Company, PostRow } from "src/models/data/data.model";
import { DeletePost } from "src/models/user/user.actions";
import { Serialized } from "../../common/types";

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

  @Input() post!: Serialized<PostRow>;
  company!: Serialized<Company>;

  ngOnInit() {
    if ( this.post )
      this.company = PostRow.getCompany(this.post);
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
    this.store.dispatch(new DeletePost(this.post.id));
  }

  toLocateDate(date?: string) {
    return date ? new Date(date).toLocaleDateString('fr') : "(Non renseigné)";
  }
};
