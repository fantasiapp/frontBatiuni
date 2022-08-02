import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, Output, EventEmitter } from "@angular/core";
import { Select } from "@ngxs/store";
import { Observable, Observer } from "rxjs";
import { take } from "rxjs/operators";
import { HttpService } from "src/app/services/http.service";
import { delay } from "src/app/shared/common/functions";
import { StripeService } from "src/app/shared/services/stripe";
import { productList } from "src/app/stripeProducts";
import { Profile } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";

export interface abonnementType{
    title: string,
    prices$: Observable<SubscriptionPrice[]>,
    advantages: string[], 
    product: string,
}

export interface SubscriptionPrice{
    id: string,
    amount: number,
    intervalCount: number,
}

@Component({
    selector: "abonnement",
    templateUrl: "abonnement.page.html",
    styleUrls: ["abonnement.page.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbonnementPage {
    
    @Select(DataQueries.currentProfile)
    profile$!: Observable<Profile>;

    abonnementOnView: number = 0;
    openEngagment: boolean = false
    openEngagmentPage: boolean = false
    selectedAbonnementId: number = -1
    abonnements: abonnementType[] = [
        {
            title: 'Accès deux profil',
            prices$: new Observable((observer) => {
                this.fetchPrices(productList["subscriptionSTPME"], observer);
            }),
            advantages: ['Trouver les meilleurs chantiers', 'Porte-documents électroniques', 'Organisation plus efficace', 'Suivi de chantier', 'Annonces illimitées', 'Accès salariés'],
            product: productList["subscriptionSTPME"],
        },
        {
            title: 'Accès PME',
            prices$: new Observable((observer) => {
                this.fetchPrices(productList["subscriptionPME"], observer);
            }),
            advantages: ['Suivi de chantier', 'Annonces ilimitées', 'Accès salariés'],
            product: productList["subscriptionPME"],
        },
        {
            title: 'Accès ST',
            prices$: new Observable((observer) => {
                this.fetchPrices(productList["subscriptionST"], observer);
            }),
            advantages: ['Trouver les meilleurs chantiers', 'Porte-documents életroniques', 'Organisation plus efficace'],
            product: productList["subscriptionST"],
        }
    ]
    stripe: any;

    subscriptionDetails: any = {};

    @Input()
    abonnementSwipeUp!: boolean;

    @Output()
    abonnementSwipeUpChange = new EventEmitter<boolean>();

    constructor(
        private http: HttpService,
        private cd: ChangeDetectorRef,
        private stripeService: StripeService
        ){
    }

    ngOnInit(){
        this.stripe = this.stripeService.stripe;
        this.profile$.pipe(take(1)).subscribe((profile) => {
            if(profile.company.stripeSubscriptionStatus == "active"){
                this.fetchSubscriptionDetails(profile.company.stripeSubscriptionId)
            }
        })
    }


    ngAfterViewInit(){
        let scroll = document.getElementsByClassName('caroussel__wrapper')
        if (scroll.length) {
            scroll[0].scrollTo({
                top:0,
                left: 326
            })
        }
    }

    scrollLeft() {
        let scroll = document.getElementsByClassName('caroussel__wrapper')
        scroll[0].scrollTo({
            top:0,
            left:326 + scroll[0].scrollLeft,
            behavior:'smooth'
        })
    }
    scrollRight() {
        let scroll = document.getElementsByClassName('caroussel__wrapper')
        scroll[0].scrollTo({
            top:0,
            left: -326 + scroll[0].scrollLeft,
            behavior:'smooth'
        })
    }

    updateAbonnementSwipeUp(event: any){
        this.abonnementSwipeUp = event
        this.abonnementSwipeUpChange.emit(this.abonnementSwipeUp)
    }

    onOpenEngagement(i:number) {
        this.openEngagment = true
        this.selectedAbonnementId = i
    }

    selectedPrice: SubscriptionPrice | undefined = undefined

    selectEngagement(price: SubscriptionPrice) {
        this.selectedPrice = price
    }

    fetchPrices(product: string, observer: Observer<SubscriptionPrice[]>){
        const req = this.http.post("subscription", {
            "action": "fetchPrice",
            "product": product,
        })
        let prices: SubscriptionPrice[];
        console.log("request", req)
        req.subscribe((response: any) => {
            console.log("fetchPrices", JSON.stringify(response))
            prices = response["prices"]["data"].map((price: any) => {
                return {
                    "id": price["id"],
                    "amount": price["unit_amount"]/100,
                    "intervalCount": price["recurring"]["interval_count"]
                } as SubscriptionPrice
            })
            observer.next(prices);
        })
    }

    fetchSubscriptionDetails(subscriptionId: string){
        const req = this.http.post("subscription", {
            "action": "fetchSubscriptionDetails",
            "subscriptionId": subscriptionId
        })

        console.log("request", req)
        req.subscribe((response: any) => {
            console.log("fetch subcsription", response)
            let data = response["subscriptionDetails"]
            this.subscriptionDetails.startDate = new Date(data["start_date"] * 1000)
            this.subscriptionDetails.currentStart = new Date(data["current_period_start"] * 1000)
            this.subscriptionDetails.currentEnd = new Date(data["current_period_end"] * 1000)
            this.subscriptionDetails.cancelAtPeriodEnd = data["cancel_at_period_end"]
            this.subscriptionDetails.price = data["plan"]["amount"]
            this.subscriptionDetails.interval = data["plan"]["interval_count"]
            this.cd.markForCheck()
        })
    }

    unsuscribe(){
        const req = this.http.post("subscription", {
            "action": "cancelSubscription"
        })
    }
}