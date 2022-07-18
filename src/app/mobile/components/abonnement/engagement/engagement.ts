import { Component, ChangeDetectionStrategy, Input } from "@angular/core";
import { throwIfEmpty } from "rxjs/operators";
import { abonnementType } from "../abonnement.page";

export type engagementType = abonnementType & {
    reducedMonthlyPrice: number
    length: number
}

@Component({
    selector: "engagement",
    templateUrl: "engagement.html",
    styleUrls: ["engagement.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EngagementPage {

    @Input() abonnementLength!: number
    @Input() abonnement!: abonnementType

    
    engagment!: engagementType


    constructor() {
    }

    ngOnInit(){
        this.engagment = {
            title: this.abonnement.title,
            reducedMonthlyPrice: this.abonnement.monthlyPrice * (this.abonnementLength === 3 ? 1 : this.abonnementLength === 6 ? 0.9 : this.abonnementLength === 12 ? 0.8 : 1),
            monthlyPrice: this.abonnement.monthlyPrice,
            advantages: this.abonnement.advantages,
            length: this.abonnementLength

        }
    }
}