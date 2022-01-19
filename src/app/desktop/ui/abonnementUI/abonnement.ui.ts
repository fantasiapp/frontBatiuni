import { Component, Input} from "@angular/core";
@Component({
    selector: "abonnement-card",
    templateUrl: "abonnement.ui.html",
    styleUrls: ["abonnement.ui.scss"]
})
export class UIAbonnement {

    @Input()
    cardstars : string = 'assets/starBlue.svg'

    @Input()
    duration : number = 6

    @Input()
    newprice : number = 6

}