import { ChangeDetectionStrategy, Component } from "@angular/core";
import { animate, style, transition, trigger } from "@angular/animations";

@Component({
    selector:"mission-page",
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
    templateUrl:'mission.page.html',
    styleUrls:['mission.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MissionPage {
  activeView: number = 0;
  annonces = new Array(10).fill(0);
  showFilters:boolean = false;
  _openCloseMission: boolean = false
}

