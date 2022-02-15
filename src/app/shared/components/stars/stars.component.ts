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

  get spanWidth() {
    return (+(this._value!) * ratingStarWidth) + 'px';
  } 

  get fullStarUrl() {
    return `url(assets/starFull.svg)`;
  }

  constructor(cd: ChangeDetectorRef, private ref: ElementRef) {
    super(cd);
  }

  @HostListener('click', ['$event'])
  private onClick(e: MouseEvent) { this.onChange(e); }

  protected getInput(e: MouseEvent): string | number {
    const rect = this.ref.nativeElement.getBoundingClientRect() as DOMRect;
    return Math.round((e.clientX - rect.x)/rect.width * 10) / 2;
  }
}