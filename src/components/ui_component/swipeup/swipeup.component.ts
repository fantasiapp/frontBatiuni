import { ChangeDetectionStrategy, Component, Input, SimpleChange, SimpleChanges } from "@angular/core";
import { UIOpenMenu } from "src/common/classes";

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
  
  willClose = false;
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