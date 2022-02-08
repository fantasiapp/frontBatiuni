import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Post, PostRow } from "src/models/data/data.model";


@Component({
  selector: 'annonce-page',
  templateUrl: 'annonce.page.html',
  styleUrls: ['annonce.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnoncePage {
  activeView: number = 0;
  constructor(private router:ActivatedRoute){

  }
  post!:Post
  ngOnInit() {
    let id = this.router.snapshot.params.id
    if(id) this.post = PostRow.getById(+id).serialize();
  }
}