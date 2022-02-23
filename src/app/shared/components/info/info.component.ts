import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Injectable, Input } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Destroy$ } from "../../common/classes";

export type Info = {
  type: 'error' | 'success' | 'info';
  content: string;
  time: number;
  alignWith?: InfoAlignType;
};

export type InfoAlignType = 'header' | 'paging' | 'header_search' | 'last';

const TRANSITION_TIME = 150;
const HEADER_HEIGHT = 60;
const PAGING_HEIGHT = 75;
const HEADER_SEARCH_HEIGHT = 150;

function getHeight(top: InfoAlignType) {
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
export class InfoHandler extends Destroy$ {
  content: string = '';
  time: number = 5000;

  type: string = '';

  @Input()
  fromService: boolean = false;

  private top: number = HEADER_HEIGHT;
  @HostBinding('style.top')
  get alignTop() {
    return `calc(env(safe-area-inset-top) + ${this.top}px)`;
  }

  private alignStack: InfoAlignType[] = ['header']; //default

  constructor(private cd: ChangeDetectorRef, private service: InfoService) {
    super();
  }

  ngOnInit() {
    if ( ! this.fromService ) return;
  
    this.service.infos$.pipe(takeUntil(this.destroy$)).subscribe((info) => {
      if ( info )      
        this.show(info);
      else
        this.hide();
    });

    this.service.alignWith$.pipe(takeUntil(this.destroy$)).subscribe((alignWith) => {
      if ( alignWith == 'last' ) {
        this.alignStack.pop();
        alignWith = this.alignStack[this.alignStack.length - 1];
      }
      else 
        this.alignStack.push(alignWith);
      
      this.top = getHeight(alignWith);
      this.cd.markForCheck();
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
    this.cd.markForCheck();
    
    if ( this.time != Infinity ) {
      this.createTimer(() => {
        this.hide();
        //only works with markForCheck
        this.cd.markForCheck();
      }, this.time + TRANSITION_TIME);
    }

    this.cd.markForCheck();
  }

  private hide() {
    this.type = '';
    this.content = '';
    this.resetTimer();
    this.cd.markForCheck();
  }
};

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  infos$ = new Subject<Info | null>();
  alignWith$ = new Subject<InfoAlignType>();

  show(type: 'error' | 'success' | 'info', content: string, time: number = Infinity, alignWith?: InfoAlignType) {
    this.infos$.next({
      type, content, time
    });

    if ( alignWith ) this.alignWith$.next(alignWith);
  }

  alignWith(alignWith: InfoAlignType) {
    this.alignWith$.next(alignWith);
  }

  hide() {
    this.infos$.next(null);
  }

  ngOnDestroy() {
    this.infos$.complete();
  }
};