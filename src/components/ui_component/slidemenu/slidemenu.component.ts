import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UIOpenMenu } from "src/common/classes";

@Component({
  selector: 'slidemenu',
  templateUrl: './slidemenu.component.html',
  styleUrls: ['./slidemenu.component.scss']
})
export class UISlideMenuComponent extends UIOpenMenu {
  constructor() {
    super();
  }

  close() {
    this.openChange.emit(this.open = false);
  }
}