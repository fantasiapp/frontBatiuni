import { ChangeDetectionStrategy, Component, ElementRef, HostListener } from "@angular/core";
import { UIOpenMenu } from "src/app/shared/common/classes";

const TRANSITION_DURATION = 200;
@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIPopup extends UIOpenMenu {
  constructor() { super(); this._open = true }

  willClose = false;
  close() {
    this.willClose = true;
    setTimeout(() => {
      this.willClose = false;
      this._open = false;
      this.openChange.emit(this._open = false); //this saves cd.markForCheck() ??
    }, TRANSITION_DURATION);
  }
}