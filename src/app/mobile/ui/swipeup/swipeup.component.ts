import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { UIOpenMenu } from "src/app/shared/common/classes";

const TRANSITION_DURATION = 250;

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

  willClose = false;
  close() {
    this.willClose = true;
    setTimeout(() => {
      this.willClose = false;
      this._open = false;
      this.openChange.emit(this._open = false); //this saves cd.markForCheck() ??
    }, TRANSITION_DURATION);
  }
};