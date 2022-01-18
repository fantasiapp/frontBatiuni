import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener } from "@angular/core";

@Component({
  selector: 'info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoHandler {
  content: string = '';
  time: number = 5000;

  @HostBinding('class')
  type: string = '';

  constructor(private cd: ChangeDetectorRef) {

  }

  show(type: 'error' | 'success' | 'info', content: string, time: number = this.time) {
    if ( !content ) return;
    this.content = content;
    this.type = type;
    this.cd.markForCheck();
    setTimeout(() => {
      this.type = '';
      this.cd.markForCheck();
    }, time);
  }
};