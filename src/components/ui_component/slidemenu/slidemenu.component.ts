import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { UIOpenMenu } from "src/common/classes";

@Component({
  selector: 'slidemenu',
  templateUrl: './slidemenu.component.html',
  styleUrls: ['./slidemenu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UISlideMenuComponent extends UIOpenMenu {
  @ViewChild('content', {static: true})
  contentRef!: ElementRef;

  constructor() {
    super();
  }

  ngOnInit() {
    
  }

  resetScroll() {
    this.contentRef.nativeElement.scrollTop = 0;
  }

  close() {
    this.openChange.emit(this.open = false);
  }
}