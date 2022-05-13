import { Component, Input,} from "@angular/core";
import { Post } from "src/models/new/data.interfaces";

@Component({
  selector: 'booster-page',
  templateUrl: './booster.page.html',
  styleUrls: ['./booster.page.scss'],
  
})
export class BoosterPage {

  @Input()
  post!: Post;



  ngOnInit() {
    console.log('booster page');
    console.log(this.post);
  }
};