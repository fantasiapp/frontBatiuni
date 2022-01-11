import { Component } from "@angular/core";



@Component({
    selector: 'step',
    templateUrl: 'step.ui.html',
    styleUrls: ['step.ui.scss']
})
export class StepUI {

    constructor() {}
    id : any;
    changeBack(e: Event,id:number)  {
        let circle = (e.target as any)
        circle.style.backgroundColor = 'black'
    }
}