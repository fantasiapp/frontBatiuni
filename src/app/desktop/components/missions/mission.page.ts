import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector:"mission-page",
    templateUrl:'mission.page.html',
    styleUrls:['mission.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MissionPage {
    activeView: number = 0;
    annonces = new Array(10).fill(0);
}