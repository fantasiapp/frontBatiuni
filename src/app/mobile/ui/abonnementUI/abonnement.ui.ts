import { Component, Input, Output, EventEmitter} from "@angular/core";
import {  abonnementType } from "../../components/abonnement/abonnement.page";
import { EngagementPage } from "../../components/abonnement/engagement/engagement";

@Component({
    selector: "abonnement-card",
    templateUrl: "abonnement.ui.html",
    styleUrls: ["abonnement.ui.scss"],
})

export class UIAbonnement {

    cardstars : string = 'assets/starBlue.svg'

    duration : number = 6

    newprice : number = 6
    @Input() abonnement!: abonnementType;
    @Input() subscriptionType!: number;

    @Output() openEngagment = new EventEmitter()


    constructor() {
    }   
    ngOnInit(){
    } 

    onEngagment() {
        this.openEngagment.next(this.subscriptionType)
    }
}