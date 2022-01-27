import { ChangeDetectionStrategy, Component, Directive, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subscription } from "rxjs";
import { UIDefaultAccessor } from "src/app/shared/common/classes";

@Directive({
  selector: 'radiobox[formControlName]'
})
export class UIRadioAccessor extends UIDefaultAccessor<string | boolean | number> {
  static map = new Map<string, UIRadioAccessor[]>();

  @Input('formControlName')
  controlName: string = '';

  subscription?: Subscription;
  constructor(private host: UIRadioboxComponent) {
    super();
  }

  ngOnInit() {
    this.host.name = this.controlName;
    let items = UIRadioAccessor.map.get(this.host.name);
    if ( ! items ) UIRadioAccessor.map.set(this.host.name, items = []);
    items.push(this);
    
    this.subscription = this.host.selection.subscribe((next) => {
      const value = this.onChange(next);
      for ( const radioAccessor of UIRadioAccessor.map.get(this.controlName)! )
        radioAccessor.value = value;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    let items = UIRadioAccessor.map.get(this.host.name), index;
    if ( !items ) return;

    index = items.indexOf(this);
    if ( index >= 0 )
      items.splice(index, 1);
    
    if ( items.length == 0 ) {
      UIRadioAccessor.map.delete(this.host.name);
    }
  }

  writeValue(value: string | number | boolean): void {
    let items = UIRadioAccessor.map.get(this.host.name);
    items?.forEach(item => {
      item.host.valueChange.emit(item.host.value = (item.host.onselect == value));
      item.host.forceUpdate();
    });
  }
};

@Component({
  selector: 'radiobox',
  template: `
    <input type="radio" [attr.name]="name || null" [value]="onselect" (change)="onChange($event)" [attr.checked]="value || null" tabindex="-1"/>
    <span></span>
  `,
  styleUrls: ['./box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: UIRadioAccessor
  }]
})
export class UIRadioboxComponent {
  @Input() name: string = '';
  @Input() onselect: string | boolean | number = "";

  //compatibility
  @Input() value: boolean = false;
  @Output() valueChange = new EventEmitter<boolean>();

  //action used in accessors
  @Output() selection = new EventEmitter<string | boolean | number>();

  constructor(private cd: ChangeDetectorRef) {}

  onChange(e: Event) {
    this.valueChange.emit(this.value = true);
    this.selection.emit(this.onselect);
  }

  forceUpdate() { this.cd.markForCheck(); }
};