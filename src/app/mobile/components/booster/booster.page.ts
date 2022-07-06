import { ChangeDetectorRef, Component, Input,} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { NavigationExtras, Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { SlidemenuService } from "src/app/shared/components/slidemenu/slidemenu.component";
import { productList } from "src/environments/environment";
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
    private popup: PopupService,
    private router: Router
    ) {}

  ngOnInit() {
  }

  openPayment() {
    let navigationExtras: NavigationExtras = {};
    switch (this.selected){
      case "3":
        navigationExtras = {state: {product: productList.boost3}}
        break;
      case "7":
        navigationExtras = {state: {product: productList.boost7}}
        break;
      case "0":
        navigationExtras = {state: {product: productList.boost0}}
        break;
    }
    this.slideService.hide();
    this.router.navigate(['payment'], navigationExtras)
  }

  boostPost(){
    this.store.dispatch(new BoostPost(this.post.id, parseInt(this.selected))).subscribe(
      (response) => {
      }
    )
    
  }

  get selected() {
    return this.boostForm.value.duration;
  }
};