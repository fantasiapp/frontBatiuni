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

export type InfoAlignType = 'header' | 'paging' | 'header_search' | 'header_search_switch' | 'last' | 'paging_switch';

const TRANSITION_TIME = 150;
const HEADER_HEIGHT = 4*16; // $sticky-header-height, header normal
// const HEADER_SWITCH_HEIGHT = 106; // header norma + switch
const PAGING_HEIGHT = 75;
const HEADER_SEARCH_HEIGHT = 150;
// const HEADER_SEARCH_HEIGHT_SWITCH = 192;
const SWITCH_HEADER_OVERLAY = 42

function getHeight(top: InfoAlignType) {
  if ( top == 'header' )
    return HEADER_HEIGHT;
  else if ( top == 'paging' ) 
    return PAGING_HEIGHT;
  // else if ( top == 'paging_switch')
  //   return HEADER_SWITCH_HEIGHT
  // else if ( top == 'header_search_switch'){
  //   return HEADER_SEARCH_HEIGHT_SWITCH
  // }
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
  isOverflowing: boolean = false;
  bothOverlay: boolean = false
  bothOverlayStack: boolean[] = [false]

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
      
      this.top = getHeight(alignWith) + (this.bothOverlay ? SWITCH_HEADER_OVERLAY : 0)

      console.log('info OVERLATY', alignWith, this.alignStack, this.top, this.bothOverlay);
      this.cd.markForCheck();
    });
    this.service.bothOverlay$.pipe(takeUntil(this.destroy$)).subscribe((b)=> {
      if(b == null){
        this.bothOverlayStack.pop() 
        this.bothOverlay = this.bothOverlayStack[this.bothOverlayStack.length - 1] || this.bothOverlay
      } else {
        this.bothOverlayStack.push(b)
        this.bothOverlay = b

      }
      console.log('info OVERLATY', b, this.bothOverlay, this.bothOverlayStack);
    })
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
    console.log('info', info);
    this.textOverflow(info.content.length)
    if ( !info.content ) return;
    this.resetTimer();
    this.content = info.content;
    this.type = info.type;
    this.time = info.time || 2000;
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

  textOverflow(textLength: number) {
    let textPixel = textLength*7.5
    let screenSize = window.screen.width
    console.log("e", screenSize, textPixel)
    if (textPixel > screenSize){
      this.isOverflowing = true;
    }
    else {
      this.isOverflowing = false;
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  infos$ = new Subject<Info | null>();
  alignWith$ = new Subject<InfoAlignType>();
  bothOverlay$ = new Subject<boolean | null>();

  show(type: 'error' | 'success' | 'info', content: string, time: number = Infinity, alignWith?: InfoAlignType) {
    this.infos$.next({
      type, content, time
    });

    if ( alignWith ) this.alignWith$.next(alignWith);
  }

  enableBothOverlay(b: boolean | null){
    this.bothOverlay$.next(b)
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
