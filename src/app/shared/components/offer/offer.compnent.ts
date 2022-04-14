import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Input, Output} from "@angular/core";
import { Store } from "@ngxs/store";
import { Subject } from "rxjs";
import { take } from "rxjs/operators";
import { Post, Company, Mission } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";
import { DeletePost } from "src/models/new/user/user.actions";
import { PopupService } from "../popup/popup.component";

@Component({
  selector: 'offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferComponent { 

  constructor(private store: Store, private popup: PopupService) {}

  @Input()
  src: string = "assets/confirmation.svg"

  @HostListener('press')
  onPress(e: any) {
    if ( this.deletable ) {
      const subject = new Subject<boolean>();
      subject.pipe(take(1)).subscribe((result) => {
        if ( result ) this.deletePost()
        this.popup.hide();
      });
      this.popup.openDeletePostDialog(subject);
    } 
  }

  @Input()
  deletable: boolean = false;

  company: Company | null = null;
  private _post!: Post | null;
  get post() {
    return this._post; }

  get isClosed() {
    let mission = this._post as Mission
    if (mission && mission.isClosed)
      return mission.isClosed
    return false
  }

  get hasPostulated() {
    const profile = this.store.selectSnapshot(DataQueries.currentProfile)
    let companiesId;
    if(this._post){
      companiesId = this._post.candidates?.map((id:number) => {

        let candidate = this.store.selectSnapshot(DataQueries.getById('Candidate', id))
        console.log('Candidates', candidate);
        return candidate!.company
      })
    }
    return companiesId?.includes(profile.company.id)
  }
  
  @Input() set post(p: Post | null) {
    this._post = p;
    this.company = p ? this.store.selectSnapshot(DataQueries.getById('Company', p.company)) : null;
  }

  deletePost() {
    this.store.dispatch(new DeletePost(this.post!.id));
  }

  toLocateDate(date?: string) {
    return date ? new Date(date).toLocaleDateString('fr') : "(Non renseigné)";
  }
};