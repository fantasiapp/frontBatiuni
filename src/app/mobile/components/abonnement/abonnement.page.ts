import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { Observable, Observer } from "rxjs";
import { HttpService } from "src/app/services/http.service";
import { StripeService } from "src/app/shared/services/stripe";
import { productList } from "src/app/stripeProducts";

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
    
    abonnementOnView: number = 0;
    openEngagment: boolean = false
    openEngagmentPage: boolean = false
    currentAbonnementId: number = -1
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

    constructor(
        private http: HttpService,
        private cd: ChangeDetectorRef,
        private stripeService: StripeService
        ){
    }

    ngOnInit(){
        this.stripe = this.stripeService.stripe;
        console.log("stripe abonnement", this.stripe);
    }


    ngAfterViewInit(){
        let scroll = document.getElementsByClassName('caroussel__wrapper')
        scroll[0].scrollTo({
            top:0,
            left: 326
        })
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

    onOpenEngagement(i:number) {
        this.openEngagment = true
        this.currentAbonnementId = i
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
}