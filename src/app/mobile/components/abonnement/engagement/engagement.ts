import { Component, ChangeDetectionStrategy, Input } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { throwIfEmpty } from "rxjs/operators";
import { abonnementType, SubscriptionPrice } from "../abonnement.page";

export type engagementType =  {
    title: string,
    product: string,
    selectedPrice: SubscriptionPrice,
}

@Component({
    selector: "engagement",
    templateUrl: "engagement.html",
    styleUrls: ["engagement.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EngagementPage {

    @Input() abonnement!: abonnementType

    @Input() selectPrice!: SubscriptionPrice;
    
    engagment!: engagementType


    constructor(private router: Router) {
    }

    ngOnInit(){
        this.engagment = {
            title: this.abonnement.title,
            product: this.abonnement.product,
            selectedPrice: this.selectPrice,
        }
    }

    subscriptionCheckout(){
        let navigationExtras: NavigationExtras = {state: {
            type: "subscription",
            priceId: this.selectPrice.id,
            product: this.engagment.product,
        }}
        this.router.navigate(['payment'], navigationExtras)
    }
}