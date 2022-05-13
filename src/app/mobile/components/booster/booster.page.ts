import { Component, Input,} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Store } from "@ngxs/store";
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

  constructor(private store: Store) { }

  ngOnInit() {
    console.log('booster page');
    console.log(this.post);
  }

  boostPost(){
    console.log('add boost');
    console.log("boost duration", this.selected);
    this.store.dispatch(new BoostPost(this.post.id, this.selected));
  }

  get selected() {
    return this.boostForm.value.duration;
  }
};