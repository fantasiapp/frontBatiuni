import { Component, Input, OnInit } from '@angular/core';
import { Candidate, Mission, Post } from 'src/models/new/data.interfaces';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {
  
  
  private _post!: Post | null;
  get post() {
    return this._post; }

  @Input() set post(p: Post | null) {
    this._post = p;
  }

  private _candidate!: Candidate | null;
  @Input() set candidate(c: Candidate | null) {
    this._candidate = c;
  }

  bannerString: String = 'Placeholder';
  counterOfferPrice!: string;

  constructor() { 
  }
  
  get isClosed() {
    let mission = this._post as Mission
    if (mission) return mission.isClosed
    return false
  }

  ngOnInit(): void {
    let mission = this._post as Mission
    if (mission.isClosed) {
      this.bannerString = 'Mission cloturée'
    } else {
      let counterOfferPrice = this.post?.candidates;
      this.counterOfferPrice = counterOfferPrice + '€' // placeholder
      this.bannerString = 'Contre offre : ';

    }
  }

}
