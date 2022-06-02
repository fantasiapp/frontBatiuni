import { ChangeDetectorRef, Component, Input,} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Store } from "@ngxs/store";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { SlidemenuService } from "src/app/shared/components/slidemenu/slidemenu.component";
import { Post } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";
import { BoostPost } from "src/models/new/user/user.actions";

@Component({
  selector: 'booster-page',
  templateUrl: './booster.page.html',
  styleUrls: ['./booster.page.scss'],
  
})
export class BoosterPage {

  @Input()
  post!: Post;

  boostForm = new FormGroup({
    duration: new FormControl(undefined),
  });

  constructor(
    private store: Store,
    private slideService: SlidemenuService,
    private cd: ChangeDetectorRef, 
    private popup: PopupService
    ) {}

  ngOnInit() {
  }

  showPopUp(){
    this.popup.boostPost(this.post, this.boostForm.value, this)
  }

  boostPost(){
    this.store.dispatch(new BoostPost(this.post.id, parseInt(this.selected))).subscribe(
      (response) => {
        this.slideService.hide();
      }
    )
    
  }



  get selected() {
    return this.boostForm.value.duration;
  }
};