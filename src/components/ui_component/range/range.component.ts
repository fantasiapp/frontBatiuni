import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild} from "@angular/core";

@Component({
  selector: 'range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RangeComponent {

  @ViewChild('lower', {static: true})
  lower!: ElementRef;

  
  @ViewChild('upper', {static: true})
  upper!: ElementRef;

  @Input()
  min : number = 0;
  @Input()
  max : number = 100;
  value : number = this.min;
  @Input()
  unit : string = 'km';

  lowerValue: number = 0;
  uppervalue: number = 0;


  onClick(e: any) {
    e.preventDefault()
    e.target.value = 0;
  }
} 

