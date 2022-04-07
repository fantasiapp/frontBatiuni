import { Component, Input, OnInit } from '@angular/core';
import { Mission, Post } from 'src/models/new/data.interfaces';

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

  bannerString!: String | null;
  counterOfferPrice!: string;

  constructor() { 
  }
  
  get isClosed() {
    let mission = this._post as Mission
    if (mission) return mission.isClosed
    return false
  }

  ngOnInit(): void {
    if (this.isClosed) {
      this.bannerString = 'Mission cloturée'
    } else {
      let amount = this.post?.amount;
      this.counterOfferPrice = amount + '€' // placeholder
      this.bannerString = 'Contre offre : ';

    }
  }

}
