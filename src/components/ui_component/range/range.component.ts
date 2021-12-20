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

  lowerValue: number = this.min;
  upperValue: number = this.max;

  tolerance = 5;

  inRange(x: number) {
    return this.lowerValue <= x && x <= this.upperValue;
  }

  onClick(e: any) {
    e.preventDefault();
    let value = +e.target.value,
      movingLower = (value - this.tolerance) <= this.lowerValue,
      movingUpper = (value + this.tolerance) >= this.upperValue,
      movingRange = this.lowerValue <= value && value <= this.upperValue;

    console.log('movingLower:', (value - this.tolerance) <= this.lowerValue, '| movingUpper:', (value + this.tolerance) >= this.upperValue, '| value:', value, '| lowerValue:', this.lowerValue, '| upperValue:', this.upperValue);
    
    if ( movingLower ) {
      //nothing
      e.target.value = this.upperValue;
      this.lowerValue = value;
    } else if ( movingUpper ) {
      
    } else if ( movingRange ) {
      //move the range
      let diff = value - (movingUpper ? this.upperValue : this.lowerValue);
      this.lowerValue = Math.min(this.max, Math.max(this.min, this.lowerValue + diff));
      this.upperValue += Math.min(this.max, Math.max(this.min, this.lowerValue + diff));
    }

  }
} 

