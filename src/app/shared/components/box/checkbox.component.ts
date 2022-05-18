import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Directive, EventEmitter, Input, Output } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UIDefaultAccessor } from "src/app/shared/common/classes";

@Directive({
  selector: "checkbox[formControlName]",
})
export class UICheckboxAccessor extends UIDefaultAccessor<
  string | boolean | number
> {


  @Input("formControlName")
  controlName: string = "";

  constructor(cd : ChangeDetectorRef) {
    super(cd);
  }

  writeValue(value: any): void {
    if (value == null || value == undefined) return;
    this.onChange(value);
    this.cd.markForCheck();
  }
}
@Component({
  selector: 'checkbox',
  template: `
    <input 
      type="checkbox" 
      (input)="onChange($event)" 
      [checked]="value || null" 
      tabindex="-1"/>
    <span></span>
  `,
  styleUrls: ['./box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: UICheckboxAccessor
    }
  ]
})
export class UICheckboxComponent{
  
  constructor(private cd: ChangeDetectorRef) {
  }

  //compatibility
  @Input() value: boolean = false;
  @Output() valueChange = new EventEmitter<boolean>();

  //action used in accessors
  @Output() selection = new EventEmitter<string | boolean | number>();

  ngOnInit() {
  }
  onChange(e: Event) {
    this.value = this.getInput(e);
    this.valueChange.emit(this.value);
    this.cd.markForCheck()
  }

  getInput(e: Event) {
    let target = e.target as HTMLInputElement;
    return target.checked;
  }
};
