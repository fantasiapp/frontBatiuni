import { Component, EventEmitter, Input, Output } from "@angular/core";



@Component({
    selector: 'step',
    templateUrl: 'step.ui.html',
    styleUrls: ['step.ui.scss']
})
export class StepUI {

    constructor() {}
    @Input()
    direction: 'horizontal' | 'vertical' = 'horizontal';

    @Input()
    tacheIndex = 0;

    @Input()
    tacheList = [
        {name:"Besoins de l’entreprise"},
        {name:"Infos chantiers"},
        {name:"Rémunération "},
        {name:"Document important à télécharger"}
    ]
    @Output()
    tacheIndexChange = new EventEmitter<number>()
   
    changeTacheIndex(id:number)  {
        this.tacheIndexChange.emit(this.tacheIndex = id);
    }
   
}
