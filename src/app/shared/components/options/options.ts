import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UIDefaultAccessor } from "src/common/classes";
import { getTopmostElement, makeid } from "src/common/functions";
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

  @HostBinding('attr.tabindex')
  get tabIndex() { return 0; }

  //make generic and share class
  @HostListener('focus')
  onFocus() { this.showDropDown = true; }

  @HostListener('blur')
  onBlur() { this.showDropDown = false; }

  private static instances: OptionsModel[] = [];
  //clicking on selected item closes the list
  private static listener = (e: Event) => {
    const focused = e.target as HTMLElement,
      mounted = getTopmostElement(focused).parentElement !== null;

    if ( !mounted ) return;
    for( const option of OptionsModel.instances )
      if ( ! option.ref.nativeElement.contains(focused) ) {
        option.forceClose();
        continue;
      }
  };

  private static listening: boolean = false;

  ngOnInit() {
    OptionsModel.instances.push(this);
    if ( !OptionsModel.listening )
      window.addEventListener('click', OptionsModel.listener);
  }

  constructor(public ref: ElementRef, private cd: ChangeDetectorRef) {
    super();
    this.value = [];
  }

  forceClose() {
    this.showDropDown = false;
    this.cd.detectChanges();
  }

  private _options: Option[] = [];
  get options() { return this._options; }  
  @Input()
  set options(val: Option[]) {
    this.search = '';
    this._options = val;
    this.value = val.filter(option => option.checked);
  }


  @Input()
  showChosenItems: boolean = true;

  @Input()
  searchable: boolean = true;

  _type: ['checkbox' | 'radio', string] = ['checkbox', ''];
  
  @Input()
  set type(value: 'checkbox' | 'radio') {
    if ( value == 'checkbox' ) this._type = [value, ''];
    else { this._type = [value, makeid(8)]; };
  };

  filterOptions(e: Event) {
    this.search = (e.target as any).value;
}

  get availableOptions() {
    return this.options.filter(option => option.name.toLowerCase().includes(this.search.toLowerCase()));
  }

  getInput(action: ['delete' | 'toggle', number]) {
    const isCheckbox = this._type[0] == 'checkbox';
    if ( isCheckbox && action[0] == 'delete' ) {
      let idx = action[1];
      let indexOf = this.options.findIndex(option => option == this.value![idx]);
      
      this.options[indexOf] = {...this.options[indexOf], checked: false};
    } else if ( action[0] == 'toggle' ) {
      let id = action[1],
        indexOf = this.options.findIndex(option => option.id == id);

      if ( isCheckbox )
        this.options[indexOf] = {...this.options[indexOf], checked: !this.options[indexOf].checked};
      else
        this.options.forEach((option, idx) => option.checked = idx == indexOf);
    }

    return this.options.filter(choice => choice.checked);
  };

  ngOnDestroy() {
    const index = OptionsModel.instances.indexOf(this);
    if ( index >= 0 ) OptionsModel.instances.splice(index, 1);  
    if ( OptionsModel.instances.length == 0 ) {
      window.removeEventListener('click', OptionsModel.listener)
      OptionsModel.listening = false;
    }
  }
};