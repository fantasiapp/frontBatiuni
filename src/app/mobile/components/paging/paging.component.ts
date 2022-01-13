import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: 'paging',
  templateUrl: './paging.component.html',
  styleUrls: ['./paging.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagingComponent {

  constructor(private router: Router) {}
  
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
    if ( this.index < 0 ) {
      this.router.navigate(['', 'landing']);
      return;
    }

    this.indexChange.emit(this.index);
    this.navigate.emit(dx);
  }
};