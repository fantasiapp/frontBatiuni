import { Component } from "@angular/core";
@Component({
    selector: "abonnement",
    templateUrl: "abonnement.page.html",
    styleUrls: ["abonnement.page.scss"]
})
export class AbonnementPage {
    activeView: number = 0;

    scrollLeft() {
        let scroll = document.getElementsByClassName('caroussel')
        let offset = scroll[0];
        scroll[0].scrollTo({
            top:0,
            left:300 + scroll[0].scrollLeft,
            behavior:'smooth'
        })
    }
    scrollRight() {
        let scroll = document.getElementsByClassName('caroussel')
        let offset = scroll[0];
        scroll[0].scrollTo({
            top:0,
            left: -300 + scroll[0].scrollLeft,
            behavior:'smooth'
        })
    }

}