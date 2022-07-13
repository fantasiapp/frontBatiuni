import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";

export interface abonnementType{
    title:string,
    monthlyPrice: number,
    advantages: string[], 
}

export const abonnementArray: abonnementType[]= [
    {
        title: 'Accès deux profil',
        monthlyPrice: 50,
        advantages: ['Trouver les meilleurs chantiers', 'Porte-documents électroniques', 'Organisation plus efficace', 'Suivi de chantier', 'Annonces illimitées', 'Accès salariés']
    },
    {
        title: 'Accès PME',
        monthlyPrice: 40,
        advantages: ['Suivi de chantier', 'Annonces ilimitées', 'Accès salariés']
    },
    {
        title: 'Accès ST',
        monthlyPrice: 12,
        advantages: ['Trouver les meilleurs chantiers', 'Porte-documents életroniques', 'Organisation plus efficace']
    }
]

@Component({
    selector: "abonnement",
    templateUrl: "abonnement.page.html",
    styleUrls: ["abonnement.page.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbonnementPage {

    abonnementOnView: number = 0;
    openEngagment: boolean = false
    currentAbonnementId: number = -1
    abonnement: abonnementType[]

    constructor(private cd: ChangeDetectorRef){
        this.abonnement = abonnementArray
    }
    ngAfterViewInit(){
        let scroll = document.getElementsByClassName('caroussel')
        scroll[0].scrollTo({
            top:0,
            left:310
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

    onOpenEngagement(i:number) {
        this.openEngagment = true
        this.currentAbonnementId = i
    }

    selectedEngagmentLength = -1

    selectEngagement(n: number) {
        this.selectedEngagmentLength = n
    }
}