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
    this.fadingIn = !this.fadingIn;
    if ( this.fadingIn ) {
      if ( this.time == Infinity ) {
        this.fadingIn = !this.fadingIn;
        this.time = 500;
        //next time this function is called
        //is when were changing the color
      } else {
        setTimeout(() => {
          this.type = '';
          this.content = '';
          this.fadingIn = true;
          this.cd.markForCheck();
        }, this.time);
      }
    }
  }

  constructor(private cd: ChangeDetectorRef) { }

  show(type: 'error' | 'success' | 'info', content: string, time: number = 2500) {
    if ( !content ) return;
    this.content = content;
    this.type = type;
    this.time = time;
    this.cd.markForCheck();
  }
};