import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: 'h-steps',
  template: `
    <div class="line full-width"></div>
    <ul class="full-width flex row space-between">
      <li [class.active]="activeIndex == i" (click)="activeIndex = i" *ngFor="let item of steps; index as i" [attr.data-content]="item"></li>
    </ul>
    `,
  styles: [`
    @use "sass:math";
    @import 'src/styles/variables';
    @import 'src/styles/mixins';

    $ball-size: 40px;
    $line-thickness: 0.75px;

    :host {
      display: block;
      position: relative;
    }

    .line {
      height: $line-thickness;
      @extend %absolute-center-y;
      background-color: $buttonColor;
    }

    ul {
      list-style-type: none;
      height: $ball-size;
    }

    li {
      position: relative;
      @include circle($ball-size);
      border: (2 * $line-thickness) solid $buttonColor;

      &.active { background-color: $buttonColor; }
    }

    li::before {
      color: $buttonColor;
      display: block;
      content: attr(data-content);
      bottom: -1.5em;
      @extend %absolute-center-x;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIHSteps {
  steps: string[] = ['hello', 'world']
  activeIndex: number = 0;

  @Input('steps')
  set setSteps(steps: string[]) {
    if ( steps.length < 2 ) throw "Steps >= 2."
    this.steps = steps;
  }
};