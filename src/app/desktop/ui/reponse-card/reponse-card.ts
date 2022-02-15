import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Company, Profile } from "src/models/new/data.interfaces";
import { QueryProfile, Snapshot } from "src/models/new/data.state";

@Component({
    selector:'reponse-card',
    templateUrl: 'reponse.card.html',
    styleUrls:['reponse.card.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReponseCard {
    @QueryProfile()
    @Input('profile')
    profile$!: number | Profile | Observable<Profile>;
}