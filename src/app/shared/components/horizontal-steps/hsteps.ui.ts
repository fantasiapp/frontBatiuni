import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: 'h-steps',
  template: `
    <div class="hline full-width"></div>
    <ul class="full-width flex row space-between">
      <li *ngFor="let item of steps" [attr.data-content]="item"></li>
    </ul>
    `,
  styles: [`
    @import 'src/styles/variables';
    @import 'src/styles/mixins';

    $ball-size: 40px;
    $line-thickness: 3px;

    :host {
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
      border: 1px solid $buttonColor;

      &.active { background-color: $buttonColor; }
    }

    li::before {
      display: block;
      content: attr(data-content);
      bottom: -1.5em;
      @extend %absolute-center-x;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIHSteps {
  steps: string[] = []

  @Input('steps')
  set setSteps(steps: string[]) {
    if ( steps.length < 2 ) throw "Steps >= 2."
    this.steps = steps;
  }
};