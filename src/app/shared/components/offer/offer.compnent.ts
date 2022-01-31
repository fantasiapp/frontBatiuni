import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Input} from "@angular/core";
import { Store } from "@ngxs/store";
import { PostRow } from "src/models/data/data.model";
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

  get companyName() { return this.post ? PostRow.getCompany(this.post).name : ''; }

  ngOnInit() {

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
};
