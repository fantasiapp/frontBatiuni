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

  private fadingIn: boolean = false;

  @HostListener('transitionend')
  private onTransitionEnd() {
    console.log('transitioning');
    this.fadingIn = !this.fadingIn;
    if ( this.fadingIn ) {
      setTimeout(() => {
        this.type = '';
        this.content = '';
        this.fadingIn = true;
        this.cd.markForCheck();
      }, this.time);
    }
  }

  constructor(private cd: ChangeDetectorRef) {

  }

  show(type: 'error' | 'success' | 'info', content: string, time: number = 2500) {
    if ( !content ) return;
    this.content = content;
    this.type = type;
    this.time = time;
    this.cd.markForCheck();
  }
};