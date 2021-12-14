import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: 'paging',
  templateUrl: './paging.component.html',
  styleUrls: ['./paging.component.scss']
})
export class PagingComponent {

  @Input()
  showNext: boolean = true;

  @Input()
  showPageName: boolean = true;

  @Output()
  navigate = new EventEmitter<number>();

  @Input()
  length: number = 0;

  index: number = 0;

  onClick(dx: number) {
    this.index += dx;
    this.navigate.emit(dx);
  }
};