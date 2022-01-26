import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from "@angular/core";
import { UIOpenMenu } from "src/app/shared/common/classes";

@Component({
  selector: 'slidemenu',
  templateUrl: './slidemenu.component.html',
  styleUrls: ['./slidemenu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UISlideMenuComponent extends UIOpenMenu {
  @ViewChild('content', {static: true})
  contentRef!: ElementRef;

  @Input()
  footer: boolean = false;

  @Input()
  header: boolean = true;

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