import { Component } from "@angular/core";


@Component({
    selector: 'annonce-page',
    templateUrl: 'annonce.page.html',
    styleUrls: ['annonce.page.scss']
})
export class AnnoncePage {
    activeView: number = 0;
}