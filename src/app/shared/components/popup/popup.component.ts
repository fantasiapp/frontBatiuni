import { ChangeDetectionStrategy, Component, ElementRef, HostListener } from "@angular/core";
import { UIOpenMenu } from "src/app/shared/common/classes";

@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIPopup extends UIOpenMenu {
  constructor() { super(); this._open = true }
  close() { this.openChange.emit(this._open = false) }
}