import { ChangeDetectionStrategy, Component } from "@angular/core";


@Component({
  selector: 'annonce-page',
  templateUrl: 'annonce.page.html',
  styleUrls: ['annonce.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnoncePage {
  activeView: number = 0;
  // constructor(private router:ActivatedRoute){

  // }
  // ngOnInit() {
  //   let id = this.router.snapshot.params.id
  //   let post = PostRow.getById(+id).serialize()
  //   console.log(post)
  // }
}