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

  @Input()
  index: number = 0;

  @Output()
  indexChange = new EventEmitter<number>();

  onClick(dx: number) {
    this.index += dx;
    console.log('clicks')
    this.indexChange.emit(this.index);
    this.navigate.emit(dx);
  }
};