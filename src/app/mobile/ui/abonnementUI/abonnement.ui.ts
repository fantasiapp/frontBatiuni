import { Component, Input, Output, EventEmitter} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import {  abonnementType } from "../../components/abonnement/abonnement.page";
import { EngagementPage } from "../../components/abonnement/engagement/engagement";

@Component({
    selector: "abonnement-card",
    templateUrl: "abonnement.ui.html",
    styleUrls: ["abonnement.ui.scss"],
})

export class UIAbonnement extends Destroy$ {

    @Input()
    prices: Array<any> = [];

    cardstars : string = 'assets/starBlue.svg'

    duration : number = 6

    newprice : number = 6
    @Input() abonnement!: abonnementType;
    @Input() subscriptionType!: number;

    @Output() openEngagment = new EventEmitter()


    constructor() {
        super();
    }   

    ngOnInit(){
        // this.abonnement.prices$.pipe(takeUntil(this.destroy$)).subscribe((prices) => {
        //     this.prices = prices
        //     console.log("what", prices)
        // })
    } 

    onEngagment() {
        this.openEngagment.next(this.subscriptionType)
    }
}