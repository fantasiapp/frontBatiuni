import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

export type Info = {
  type: 'error' | 'success' | 'info';
  content: string;
  time: number;
};

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
        this.time = 5000;
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

  constructor(private cd: ChangeDetectorRef, private service: InfoService) {
    service.infos$.subscribe((info) => {
      this.show(info);
    });
  }

  private show(info: Info) {
    if ( !info.content ) return;
    this.content = info.content;
    this.type = info.type;
    this.time = info.time || 250;
    this.cd.markForCheck();
  }
};

@Injectable()
export class InfoService {

  infos$ = new Subject<Info>();

  show(type: 'error' | 'success' | 'info', content: string, time: number = 2500) {
    this.infos$.next({
      type, content, time
    });
  }
};