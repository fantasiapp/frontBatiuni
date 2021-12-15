import { Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";

@Component({
  selector: 'swipeup',
  templateUrl: './swipeup.component.html',
  styleUrls: ['./swipeup.component.scss']
})
export class UISwipeupComponent {
  @HostBinding('class.open')
  private _open: boolean = false;
  willClose = false;

  get open() { return this._open; }

  @Input()
  set open(value: boolean) {
    this._open = value;
    if ( value )
      document.body.classList.add('blocked')
    else
      document.body.classList.remove('blocked');
  }

  @Output()
  openChange = new EventEmitter<boolean>();


  close() {
    this.willClose = true;
  }

  onTransitionEnd() {
    if ( this.willClose ) {
      this.willClose = false;
      this.openChange.emit(this._open = false);
    }
  }
};