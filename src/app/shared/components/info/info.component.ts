import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Injectable } from "@angular/core";
import { Subject } from "rxjs";

export type Info = {
  type: 'error' | 'success' | 'info';
  content: string;
  time: number;
};

const TRANSITION_TIME = 150;

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


  constructor(private cd: ChangeDetectorRef, service: InfoService) {
    service.infos$.subscribe((info) => {
      if ( info )
        this.show(info);
      else
        this.hide();
    });
  }

  private nextTimeout: any = null;
  private resetTimer() {
    if ( this.nextTimeout ) {
      clearTimeout(this.nextTimeout);
      this.nextTimeout = null;
    }
  }

  private createTimer(f: Function, time: number) {
    this.resetTimer();
    this.nextTimeout = setTimeout(f, time);
  }

  private show(info: Info) {
    if ( !info.content ) return;
    this.resetTimer();
    this.content = info.content;
    this.type = info.type;
    this.time = info.time || 2500;
    
    if ( this.time != Infinity ) {
      this.createTimer(() => {
        this.hide();
        this.cd.markForCheck();
      }, this.time + TRANSITION_TIME);
    }

    this.cd.markForCheck();
  }

  private hide() {
    this.type = '';
    this.content = '';
    this.resetTimer();
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

  ngOnDestroy() {
    this.infos$.complete();
  }
};