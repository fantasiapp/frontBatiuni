import { Component, Input} from "@angular/core";

@Component({
    selector: 'range',
    templateUrl: './range.component.html',
    styleUrls: ['./range.component.scss'],
  })
export class RangeComponent { 
    @Input()
    min : number = 0;
    @Input()
    max : number = 100;
    value : number  = this.min;
    @Input()
    unit : string  = 'km';

    Slidevalue(e:Event) {
        this.value = (e.target as any).value;
    }
} 

