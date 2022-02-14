import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { CompanyRow } from "src/models/data/data.model";

@Component({
    selector:'reponse-card',
    templateUrl: 'reponse.card.html',
    styleUrls:['reponse.card.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReponseCard {

    @Input('company')
    company!:CompanyRow;
    
}