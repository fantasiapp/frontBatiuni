import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UIDefaultAccessor } from "src/common/classes";
import { Option } from "src/models/option";

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
  search: string = '';
  showDropDown: boolean = false;

  private _options: Option[] = [];
  // private _listener?: ;

  private static instances: OptionsModel[] = [];
  private static listener = (e: Event) => {
    const focused = document.activeElement;
    for( const option of OptionsModel.instances )
      if ( ! option.ref.nativeElement.contains(focused) ) {
        option.forceClose();
        continue;
      }
  };
  private static listening: boolean = false;

  constructor(public ref: ElementRef, private cd: ChangeDetectorRef) {
    super();
    this.value = [];
    OptionsModel.instances.push(this);
  }

  forceClose() {
    this.showDropDown = false;
    this.cd.detectChanges();
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

  ngOnDestroy() {
    const index = OptionsModel.instances.indexOf(this);
    if ( index >= 0 ) OptionsModel.instances.splice(index, 1);  
  }
};