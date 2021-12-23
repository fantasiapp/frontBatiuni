import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UIDefaultAccessor } from "src/common/classes";

export type Option = {
  id: number 
  name: string
  checked: boolean
};

@Component({
  selector: 'options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: OptionsModel
  }]
})
export class OptionsModel extends UIDefaultAccessor<Option[]> {
  search : string = '';
  showDropDown : Boolean =false;

  private _options: Option[] = [];

  constructor() {
    super();
    this.value = [];
  }

  @Input()
  set options(val: Option[]) {
    this.search = '';
    this._options = val;
    this.value = val.filter(option => option.checked);
  }

  @Input()
  showChosenItems: boolean = true;
  get options() { return this._options; }  

  filterOptions(e: Event) {
    let search: string = (e.target as any).value
    this.options = this.options.filter(option => option.name.toLowerCase().includes(search.toLowerCase()))
  }

  getInput(action: ['delete' | 'toggle', number]) {
    if ( action[0] == 'delete' ) {
      let idx = action[1];
      let indexOf = this.options.findIndex(option => option == this.value![idx]);
      this.options[indexOf] = {...this.options[indexOf], checked: false};
    } else if ( action[0] == 'toggle' ) {
      let idx = action[1];
      this.options[idx] = {...this.options[idx], checked: !this.options[idx].checked};
    }

    return this.options.filter(choice => choice.checked);
  };
};