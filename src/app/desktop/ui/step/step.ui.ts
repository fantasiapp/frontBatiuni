import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";

export type StepItem = {
  name: string;
}

@Component({
  selector: 'step',
  templateUrl: 'step.ui.html',
  styleUrls: ['step.ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepUI {

  constructor() {}

  @Input()
  direction: 'horizontal' | 'vertical' = 'horizontal';

  @Input()
  tacheIndex = 0;

  @Input()
  tacheList: StepItem[] = [];

  @Output()
  tacheIndexChange = new EventEmitter<number>()
  
  changeTacheIndex(id:number)  {
    this.tacheIndexChange.emit(this.tacheIndex = id);
  }
}
