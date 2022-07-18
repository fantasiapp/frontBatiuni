import { Component, ChangeDetectionStrategy, Input } from "@angular/core";
import { abonnementType } from "../abonnement.page";

@Component({
    selector: "engagement",
    templateUrl: "engagement.html",
    styleUrls: ["engagement.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EngagementPage {

    @Input() abonnementId!: number
    @Input() abonnement!: abonnementType


    constructor() {

    }

    ngOnInit(){

    }
}