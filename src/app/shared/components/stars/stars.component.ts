import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UIDefaultAccessor } from "../../common/classes";

export const ratingStarWidth = 25;

//add to forms
@Component({
  selector: 'stars',
  template: `
    <span [style.background-image]="this.fullStarUrl" [style.width]="spanWidth"></span>
  `,
  styleUrls: ['./stars.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: UIStarsComponent
  }]
})
export class UIStarsComponent extends UIDefaultAccessor<string | number> {
  @HostBinding('style.background-image')
  get emptyStarUrl() {
    return `url(assets/starEmpty.svg)`;
  }

  private _number: number = 5;
  get number() { return this._number; }

  @Input('number')
  set number(x: number) { this._number = Math.max(1, Math.floor(x)); }

  @HostBinding('style.width')
  get width() {
    return (this.number * ratingStarWidth) + 'px'; }
  
  get spanWidth() {
    return (+(this.value!) * ratingStarWidth) + 'px';
  } 

  get fullStarUrl() {
    return `url(assets/starFull.svg)`;
  }

  constructor(cd: ChangeDetectorRef, private ref: ElementRef) {
    super(cd);
  }

  @HostListener('click', ['$event'])
  private onClick(e: MouseEvent) { this.onChange(e); }

  @Input()
  step: number = 0.5;

  //between 0 - 1, how much of a step to push
  @Input() threshold: number = 0.5;
  
  _toggleMode: boolean = false;
  @Input('toggle')
  set toggleOption(toggle: boolean) {
    if ( toggle ) {
      this.number = 1;
      this.step = 1;
      this.threshold = 0;
      this._toggleMode = true;
    }
  }


  protected getInput(e: MouseEvent): string | number {
    if ( this._toggleMode ) {
      //works with undefined so cool
      console.log("getInput", this.value)
      return +!+this.value!;
    }

    const rect = this.ref.nativeElement.getBoundingClientRect() as DOMRect,
      q = 1 / this.step;
    
    //const value = Math.round((e.clientX - rect.x)/rect.width * (this.number * q)) / q;
    const ratio = (e.clientX - rect.x)/rect.width * (this.number * q),
      floor = Math.floor(ratio),
      frac = ratio - floor,
      value = frac >= this.threshold ? (floor + 1) / q : floor / q;
    return value;
  }
}