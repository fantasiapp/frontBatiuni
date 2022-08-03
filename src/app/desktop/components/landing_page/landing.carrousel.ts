import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: 'landing-carrousel-item',
  template: `
    <div class='wrapper'>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="109.376" height="108.357" viewBox="0 0 109.376 108.357">
        <defs>
            <clipPath id="clip-path">
            <path id="Quotes" d="M62,108.357V49.989c0-18.572,5.143-32.366,15.291-41C84.307,3.028,93.191,0,103.695,0V26.366c-5.7,0-16.316,0-16.316,23.624v9.15h22v49.218Zm-62,0V49.989c0-18.572,5.143-32.366,15.291-41C22.308,3.028,31.192,0,41.7,0V26.366c-5.7,0-16.316,0-16.316,23.624v9.15h22v49.218Z" transform="translate(0 0)" fill="none"/>
            </clipPath>
        </defs>
        <g id="Icons_Quotes" data-name="Icons/Quotes" opacity="0.154">
            <path id="Quotes-2" data-name="Quotes" d="M62,108.357V49.989c0-18.572,5.143-32.366,15.291-41C84.307,3.028,93.191,0,103.695,0V26.366c-5.7,0-16.316,0-16.316,23.624v9.15h22v49.218Zm-62,0V49.989c0-18.572,5.143-32.366,15.291-41C22.308,3.028,31.192,0,41.7,0V26.366c-5.7,0-16.316,0-16.316,23.624v9.15h22v49.218Z" transform="translate(0 0)" fill="none"/>
            <g id="Mask_Group_11" data-name="Mask Group 11" transform="translate(0 0)" clip-path="url(#clip-path)">
            <g id="_color" data-name="🎨 color" transform="translate(0 -3.584)">
                <rect id="Rectangle" width="109.374" height="115.526" fill="#0f557c"/>
            </g>
            </g>
        </g>
        </svg>


        <div class="company">
            <ng-container *ngIf="company; else noCompany"><img src='assets/profile.png'></ng-container>
            <ng-template #noCompany>
                <div class="no-company"></div>
            </ng-template>
        </div>    
        <div class="comment">
            <ng-content></ng-content>
        </div>
    </div>
  `,
  styles: [`
    @use 'src/styles/variables' as *;
    .wrapper {
        display: flex;
        position: relative;
        flex-direction: column;
        justify-content: space-between;
        height: 288px;
        width: 500px;
        background: white;

        color: black;
        padding: 50px 45px;
        font-size: 20px;
    }

    svg {
        position: absolute;
        right: 45px;
        top: 20px
    }

    .company {
        margin-top : 60px;

        img {
            margin-top: -60px;
            height: 85px;
            width: 85px
        }
    }
    .no-company {
        height: 3px;
        width: 113px;
        background: $primary
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingCarrouselItemComponent {
    @Input() company = false
    constructor() {

    }
};