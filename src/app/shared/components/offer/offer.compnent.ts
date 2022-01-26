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
  src: string = "assets/confirmation.svg"

  @Input()
  deletable: boolean = false;

  @Input() post!: Serialized<PostRow>;

  get companyName() { return this.post ? PostRow.getCompanyName(this.post) : ''; }

  ngOnInit() {
    console.log(this.post);
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
    console.log('deleting', this.post);
    e.stopPropagation();
  }
};
