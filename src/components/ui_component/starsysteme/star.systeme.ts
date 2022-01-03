import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
    selector: "star-systeme",
    templateUrl: "star.systeme.html",
    styleUrls: ["star.systeme.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarSysteme {
  nstars: number = 5;
  stars: any;
  note: any;
  
  @Input()
  title:string='backstar';

  constructor() {
    this.stars = Array(this.nstars).fill(0).map((x,i)=>i);
  }


  ngAfterViewInit() {
    for(let star = 0; star < this.nstars; star++) {
      let thisone = document.getElementById(`${this.title}${star}`)
      thisone!.style.fill = "white";
    }
  }
  changeBack(id: number) {
    this.note = id +1;
    for(let star = 0; star < this.nstars; star++) {
      let thisone = document.getElementById(`${this.title}${star}`)
      thisone!.style.fill = "white";
    }
    for(let star = 0; star <= id; star++) {
      let thisone = document.getElementById(`${this.title}${star}`)
      thisone!.style.fill = "#F7D454";
    }
  }

}