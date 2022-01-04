import { Component, Input } from "@angular/core";

@Component({
    selector: 'credit-card',
    templateUrl: 'credit.card.html',
    styleUrls: ['credit.card.scss']
})
export class UICreditCard {
    @Input()
    name: string = 'Jean-Luc Walter'
    @Input()
    creditType: string = 'Visa'
    @Input()
    abonnement: string = 'Prélèvement de 20 € / mois'
    @Input()
    fourDigits: string = '1234'


}