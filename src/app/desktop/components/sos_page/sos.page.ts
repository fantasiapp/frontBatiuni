import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector:'sos-page',
    templateUrl:'sos.page.html',
    styleUrls:['sos.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class SosPageComponenet {
    activeView: number = 0;

}