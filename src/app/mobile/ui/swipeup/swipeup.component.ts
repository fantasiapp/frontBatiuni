import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
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
  
  willClose = false;
  close() {
    this.willClose = true;
  }

  onTransitionEnd(e: any) {
    if ( this.willClose ) {
      this.willClose = false;
      this.openChange.emit(this._open = false);
    }
  }
};