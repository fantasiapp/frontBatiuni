import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

export type Job = {
  id: number 
  job: string
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

  @Input()
  set options(val: Job[]) {
    this.search = '';
    this._options = this.optionsSearch = val;
  }

  get options() { return this._options; }
  
  optionsSearch  = this.options;
  userChoices : Job[] = [];

  filterOptions(e: Event) {
    let search:string = (e.target as any).value
    this.optionsSearch = this.options.filter(option => option.job.toLowerCase().includes(search.toLowerCase()))
  }

  added(e: Event, id:number) {
    if( (e.target as any).checked ){
      this.options[id-1] = {...this.options[id-1], isChecked: true};
      let listtt = this.options.filter(option => option.id == id)
      this.userChoices.push(listtt[0])
    }
    
    if(!(e.target as any).checked)
      this.userChoices = this.userChoices.filter(option => option.id != id)
  }

  delete(e:Event, id:number) {
    this.options[id-1] = {...this.options[id-1], isChecked: false};
    this.userChoices = this.userChoices.filter(option => option.id != id)
  }
};