import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";




@Component({
    selector:'docusign',
    templateUrl: 'docusign.page.html',
    styleUrls:['docusign.page.scss']
})
export class DocusignPage implements OnInit {
    userName: string = '';
    userMail: string = '';

    constructor(private router: ActivatedRoute){}

    ngOnInit(){
        this.router.queryParams
        .subscribe(params=>{
            this.userName = params.name;
            this.userMail = params.email
        })
    }
}