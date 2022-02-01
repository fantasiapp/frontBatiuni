import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { UIOpenMenu } from "src/app/shared/common/classes";

@Component({
  selector: 'swipeup',
  templateUrl: './swipeup.component.html',
  styleUrls: ['./swipeup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UISwipeupComponent extends UIOpenMenu {
  constructor() {
    super();
  }

  @Input()
  type: 'list' | 'view' = 'list';

  @Output()
  onClose = new EventEmitter()
  
  willClose = false;
  close() {
    this.willClose = true;
  }

  onTransitionEnd(e: any) {
    if ( this.willClose ) {
      this.willClose = false;
      this.openChange.emit(this._open = false);
      this.onClose.emit();
      console.log(this.open, this.willClose);
    }
  }
};