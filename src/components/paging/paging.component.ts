import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: 'paging',
  templateUrl: './paging.component.html',
  styleUrls: ['./paging.component.scss']
})
export class PagingComponent {

  constructor(private router: Router) {}

  @Input()
  showNext: boolean = true;

  @Input()
  showPageName: boolean = true;

  @Output()
  navigate = new EventEmitter<number>();

  @Input()
  length: number = 0;

  @Input()
  index: number = 0;

  @Output()
  indexChange = new EventEmitter<number>();

  onClick(dx: number) {
    console.log(this.index, dx);
    this.index += dx;
    if ( this.index < 0 ) {
      this.router.navigate(['', 'landing']);
      return;
    }

    this.indexChange.emit(this.index);
    this.navigate.emit(dx);
  }
};