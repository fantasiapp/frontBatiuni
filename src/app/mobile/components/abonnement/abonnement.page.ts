import { Component, ChangeDetectionStrategy } from "@angular/core";

@Component({
    selector: "abonnement",
    templateUrl: "abonnement.page.html",
    styleUrls: ["abonnement.page.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbonnementPage {
    activeView: number = 0;
    engagmentClicked: boolean = true;
    ngAfterViewInit(){
        let scroll = document.getElementsByClassName('caroussel')
        scroll[0].scrollTo({
            top:0,
            left:302
        })
    }
    scrollLeft() {
        let scroll = document.getElementsByClassName('caroussel')
        scroll[0].scrollTo({
            top:0,
            left:310 + scroll[0].scrollLeft,
            behavior:'smooth'
        })
    }
    scrollRight() {
        let scroll = document.getElementsByClassName('caroussel')
        scroll[0].scrollTo({
            top:0,
            left: -310 + scroll[0].scrollLeft,
            behavior:'smooth'
        })
    }

}