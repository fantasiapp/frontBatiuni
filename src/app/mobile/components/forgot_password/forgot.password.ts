import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
    selector:'forgot-password',
    templateUrl:'forgot.password.html',
    styleUrls:['forgot.password.scss']
})
export class ForgorPassword {
    token:string = '';
    constructor(private route:ActivatedRoute){}
    ngOnInit() {
        this.token = this.route.snapshot.params.token;
        
    }
}