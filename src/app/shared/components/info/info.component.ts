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

  private nextTimeout: any = null;

  @HostBinding('class')
  type: string = '';

  private fadingIn: boolean = false;

  @HostListener('transitionend')
  private onTransitionEnd() {
    if ( !this.fadingIn ) return;

    if ( this.time == Infinity ) {
      this.fadingIn = true;
      this.time = 5000;
      //next time this function is called
      //is when were changing the color
    } else {
      if ( this.nextTimeout ) clearTimeout(this.nextTimeout);
      this.nextTimeout = setTimeout(() => {
        this.hide();
        this.cd.markForCheck();
      }, this.time);
    }
    this.fadingIn = !this.fadingIn;
  }

  constructor(private cd: ChangeDetectorRef, private service: InfoService) {
    service.infos$.subscribe((info) => {
      if ( info )
        this.show(info);
      else
        this.hide();
    });
  }

  private show(info: Info) {
    if ( !info.content ) return;
    this.content = info.content;
    this.type = info.type;
    this.time = info.time || 250;
    this.cd.markForCheck();
  }

  private hide() {
    this.type = '';
    this.content = '';
    this.fadingIn = true;
    if ( this.nextTimeout ) {
      clearTimeout(this.nextTimeout);
      this.nextTimeout = null;
    }
  }
};

@Injectable()
export class InfoService {

  infos$ = new Subject<Info | null>();

  show(type: 'error' | 'success' | 'info', content: string, time: number = 2500) {
    this.infos$.next({
      type, content, time
    });
  }

  hide() {
    this.infos$.next(null);
  }
};