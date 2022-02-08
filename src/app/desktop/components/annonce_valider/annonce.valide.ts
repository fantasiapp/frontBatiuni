import { Component, Input } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject } from "rxjs";
import { AuthState } from "src/models/auth/auth.state";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";


@Component({
    selector: 'annonce-valide-resumer',
    templateUrl: 'annonce.valide.html',
    styleUrls:['annonce.valide.scss']
})

export class AnnonceValidePage {
    constructor(private store:Store){

    }
    
    @Input()
    user!: User;

    ngOnInit() {
        
    }
}