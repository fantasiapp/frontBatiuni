import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Injectable } from "@angular/core";
import { Subject } from "rxjs";

export type Info = {
  type: 'error' | 'success' | 'info';
  content: string;
  time: number;
  alignWith?: 'header' | 'paging' | 'header_search';
};

const TRANSITION_TIME = 150;
const HEADER_HEIGHT = 60;
const PAGING_HEIGHT = 87;
const HEADER_SEARCH_HEIGHT = 150;

function getHeight(top: 'header' | 'paging' | 'header_search') {
  if ( top == 'header' )
    return HEADER_HEIGHT;
  else if ( top == 'paging' ) 
    return PAGING_HEIGHT;
  return HEADER_SEARCH_HEIGHT;
}

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

  private top: number = HEADER_HEIGHT;
  @HostBinding('style.top')
  get alignTop() {
    return `calc(env(safe-area-inset-top) + ${top}px)`;
  }

  constructor(private cd: ChangeDetectorRef, service: InfoService) {
    service.infos$.subscribe((info) => {
      console.log(info);
      if ( info?.alignWith )
      this.top = getHeight(info.alignWith);

      console.log('>>', this.top);

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

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  infos$ = new Subject<Info | null>();

  show(type: 'error' | 'success' | 'info', content: string, time: number = Infinity, alignWith:  'header' | 'paging' | 'header_search' = 'header') {
    this.infos$.next({
      type, content, time,
      alignWith
    });
  }

  hide() {
    this.infos$.next(null);
  }

  ngOnDestroy() {
    this.infos$.complete();
  }
};