import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { Post, Profile } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";


@Component({
  selector: 'annonce-page',
  templateUrl: 'annonce.page.html',
  styleUrls: ['annonce.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnoncePage {
  @ViewChild('addForm') public structure! : ElementRef;
  activeView: number = 0;
  constructor(private store: Store, private router: ActivatedRoute) {

  }


  post: Post | null = null;

  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  ngOnInit() {
    let id = this.router.snapshot.params.id;
    if (id !== undefined) this.post = this.store.selectSnapshot(DataQueries.getById('Post', id))
  }
  scrollTo(id: number) {
    let name = scrollmapper[id];
    (this.structure as any)[name].nativeElement.scrollIntoView({ behavior: 'smooth' , block:"center"});
  }
}
export const scrollmapper : Record<number, string>= {
  0: 'first',
  1: 'second',
  2: 'third',
  3: 'last'
}
