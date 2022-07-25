import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, NgZone, Output, QueryList, SimpleChanges } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { onClickInputScroll, returnInputKeyboard, UIDefaultAccessor } from "src/app/shared/common/classes";
import { delay, filterMap, focusOutside, getTopmostElement, makeid } from "src/app/shared/common/functions";
import { Option } from "src/models/option";
import { UIRadioboxComponent } from "../box/radiobox.component";

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

  onToggle(e: Event) {
    this.showDropDown = !this.showDropDown;
    if ( this.showDropDown ) {
      setTimeout(() => {
        const searchInput = this.ref.nativeElement.querySelector('input[type=text]');
        searchInput?.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
      });
    }
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

  ngOnInit() {
    this.test()
    OptionsModel.instances.push(this);
    if ( !OptionsModel.listening )
      window.addEventListener('click', OptionsModel.listener);
  }

  constructor(public ref: ElementRef, protected cd: ChangeDetectorRef, private zone: NgZone) {
    super(cd);
    this._value = [];
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
    this.value = [];
  }

  @Input()
  showChosenItems: boolean = true;

  @Input()
  searchable: boolean = true;

  @Input()
  ifEmpty = '';

  @Input() validateButton = true

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
    const isRadio = this._type[0] != 'checkbox';
    if ( action[0] == 'delete' ) {
      let idx = action[1],
        id = this.value![idx].id;
      
      return this.value!.filter(option => option.id != id);
    } else {
      let id = action[1],
        option = this.options.find(option => option.id == id)!;

      if ( isRadio )
        if (this.value!.length > 0 && this.value![0] == option) {return this.value!.filter(option => option.id != id)} 
        else return [option];

      if ( this.value!.find(option => option.id == id) ){
        return this.value!.filter(option => option.id != id);}
      else
        return [...this.value!, option];
    }
  };

  dropdownIncludes(option:any, value:any){
    return !!value.filter((v:any)=> v.id == option.id).length
  }

  ngOnDestroy() {
    const index = OptionsModel.instances.indexOf(this);
    if ( index >= 0 ) OptionsModel.instances.splice(index, 1);  
    if ( OptionsModel.instances.length == 0 ) {
      window.removeEventListener('click', OptionsModel.listener)
      OptionsModel.listening = false;
    }
  }

  async test() {
    // while(true){
    //   console.log("la value", this.value)
    //   await delay(5000)
    // }
  }

  writeValue(value: Option[]) {
    if (value == null || value == undefined)
      value = [];
    const ids = value.map(({id}) => id);
    this.value = filterMap(this.options, (option) => {
      return ids.includes(option.id) ? option : null;
    });
    this.cd.markForCheck();
  }

  valideButton(e: Event){
    e.preventDefault()
    this.onToggle(e)
  }

  onClickInputScroll(input: HTMLElement){
    setTimeout(() => {
      setTimeout(() => {
        input.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'start'})
      }, 600)
    }, 100)
  }
  returnInputKeyboard = returnInputKeyboard
};