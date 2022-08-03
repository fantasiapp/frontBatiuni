import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'landing-carrousel-item',
  template: `
    <div class='wrapper'>
        <div class="company"></div>    
        <div class="comment">
            <ng-content></ng-content>
        </div>
    </div>
  `,
  styles: [`
    .wrapper {
        display: flex;
        height: 288px;
        width: 500px;

    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingCarrouselItemComponent {
  constructor() {

  }
};