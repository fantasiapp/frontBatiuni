import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";

export type Job = {
  id: number 
  name: string
  isChecked: boolean
};

@Component({
  selector: 'options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionsModel {
  search : string = '';
  showDropDown : Boolean =false;

  private _options: Job[] = [];

  @Output()
  userChoice = new EventEmitter<Job[]>()

  @Input()
  set options(val: Job[]) {
    this.search = '';
    this._options = val;
  }

  get options() { return this._options; }  
  userChoices : Job[] = [];

  filterOptions(e: Event) {
    let search: string = (e.target as any).value
    this.options = this.options.filter(option => option.name.toLowerCase().includes(search.toLowerCase()))
  }

  toggle(e: Event, id: number) {
    let target = e.target as HTMLInputElement;
    this.options[id] = {...this.options[id], isChecked: target.checked};
    if( target.checked )
      this.userChoices.push(this.options[id]);
    else
      this.userChoices.splice(this.userChoices.findIndex(item => item.id == id), 1);
    
    this.userChoice.emit(this.userChoices);
  }

  delete(e: Event, idx: number, id: number) {
    e.stopPropagation();
    this.options[id] = {...this.options[id], isChecked: false };
    this.userChoices.splice(idx, 1);
    this.userChoice.emit(this.userChoices);
  }
};