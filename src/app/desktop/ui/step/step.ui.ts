import { Component, Input, Output } from "@angular/core";



@Component({
    selector: 'step',
    templateUrl: 'step.ui.html',
    styleUrls: ['step.ui.scss']
})
export class StepUI {

    constructor() {}
    @Input()
    tache = [
        {id:1, name:"TAHCE 1 "},
        {id:2, name:"TAHCE 2 "},
        {id:3, name:"TAHCE 3 "},
        {id:4, name:"TAHCE 4 "}
    ]
    // @Output()
    currentTache = 1 ;
   
    changeBack(id:number)  {
        this.currentTache = id
    }
   
}