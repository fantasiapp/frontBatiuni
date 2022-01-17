import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, NgZone, Output, ViewChild } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UIDefaultAccessor } from "src/common/classes";
import { focusOutside, getTopmostElement, makeid } from "src/common/functions";
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
  private enteredFromOutside: boolean = false;
  private exitedToOutside: boolean = false;
  private focusedOut: boolean = false;
  showDropDown: boolean = false;


  //make generic and share class
  //and fucking fix this
  @HostListener('focusin', ['$event'])
  onFocus(e: any) {
    const source = e.relatedTarget;
    e.stopPropagation();
    if ( !source ) this.enteredFromOutside = true;
    this.showDropDown = true;
    requestAnimationFrame(() => {
      const searchInput = this.ref.nativeElement.querySelector('input[type=text]');
      searchInput?.focus();
    });
  }



  @HostListener('focusout', ['$event'])
  onBlur(e: any) {
    const focused = (e as any).relatedTarget as HTMLElement;
    if ( !focused )
      return;

    if ( focusOutside(this.ref.nativeElement, focused) ) {
      this.showDropDown = false;
      this.exitedToOutside = true;
    }
  }

  @HostListener('click')
  private onClick() { this.enteredFromOutside = this.exitedToOutside = false; }

  onToggle(e: Event) {
    if ( this.enteredFromOutside  || (!this.enteredFromOutside && !this.exitedToOutside))
      this.showDropDown = !this.showDropDown;
  }

  private static instances: OptionsModel[] = [];
  //clicking on selected item closes the list
  private static listener = (e: Event) => {
    const focused = e.target as HTMLElement,
      mounted = focusOutside(null, focused);
    
    if ( !mounted ) return;
    for( const option of OptionsModel.instances )
      if ( focusOutside(option.ref.nativeElement, focused) ) {
        option.forceClose();
        continue;
      }
  };

  private static listening: boolean = false;

  ngAfterViewInit() {
    console.log('view init');
  }

  ngOnInit() {
    OptionsModel.instances.push(this);
    if ( !OptionsModel.listening )
      window.addEventListener('click', OptionsModel.listener);
  }

  constructor(public ref: ElementRef, private cd: ChangeDetectorRef, private zone: NgZone) {
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