import { animate, style, transition, trigger } from "@angular/animations";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector:'sos-page',
    animations: [
        trigger(
          'enterAnimation', [
            transition(':enter', [
              style({transform: 'translateX(-100%)', opacity: 0}),
              animate('300ms', style({transform: 'translateX(0)', opacity: 1}))
            ]),
            transition(':leave', [
              style({transform: 'translateX(0)', opacity: 1}),
              animate('200ms', style({transform: 'translateX(-100%)', opacity: 0}))
            ])
          ]
        )
      ],
    templateUrl:'sos.page.html',
    styleUrls:['sos.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class SosPageComponenet {
    activeView: number = 0;
    showFilters: boolean = false;

}