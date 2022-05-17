// import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
// import { NG_VALUE_ACCESSOR } from "@angular/forms";
// import { UIDefaultAccessor } from "src/app/shared/common/classes";
// import { makeid } from "../../common/functions";

// @Component({
//   selector: 'checkbox',
//   template: `
//     <input type="checkbox" (input)="onChange($event)" [checked]="value || null" [value]="onselect" tabindex="-1"/>
//     <span></span>
//   `,
//   styleUrls: ['./box.component.scss'],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   providers: [{
//     provide: NG_VALUE_ACCESSOR,
//     multi: true,
//     useExisting: UICheckboxComponent
//   }]
// })
// export class UICheckboxComponent extends UIDefaultAccessor<boolean> {
//   constructor(cd: ChangeDetectorRef) {
//     super(cd);
//     this._value = false;
//   }

//   @Input("formControlName")
//   controlName: string = "";

//   @Input() name: string = "";
//   @Input() onselect: string | boolean | number = makeid(5);

//   //compatibility
//   // @Input() value: boolean = false;
//   @Output() valueChange = new EventEmitter<boolean>();

//   //action used in accessors
//   @Output() selection = new EventEmitter<string | boolean | number>();


//   onChange(e: Event) {
//     // this.valueChange.emit(this.value = !this.value);
//     if (this.value) {
//       this.valueChange.emit(this.value = false);
//     } else {
//       this.valueChange.emit((this.value = true));
//     }
//     console.log(this.value)
//     console.log(e)
//     this.cd.markForCheck()
//   }

//   forceUpdate() {
//     this.cd.markForCheck();
//   }

//   getInput(e: Event) {
//     let target = e.target as HTMLInputElement;
//     return target.checked;
//   }
// };

import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subscription } from "rxjs";
import { UIDefaultAccessor } from "src/app/shared/common/classes";
import { makeid } from "../../common/functions";

//try to make all components have radio like functionality
@Directive({
  selector: "checkbox[formControlName]",
})
export class UICheckboxAccessor extends UIDefaultAccessor<
  string | boolean | number
> {
  static map = new Map<string, UICheckboxAccessor[]>();

  @Input("formControlName")
  controlName: string = "";

  subscription?: Subscription;
  constructor(cd: ChangeDetectorRef, private host: UICheckboxComponent) {
    super(cd);
  }

  ngOnInit() {
    this.host.name = this.host.name || this.controlName;
    let items = UICheckboxAccessor.map.get(this.host.name);
    if (!items) UICheckboxAccessor.map.set(this.host.name, (items = []));
    items.push(this);

    this.subscription = this.host.selection.subscribe((next) => {
      const value = this.onChange(next);
      this.writeValue(value);
      console.log("value", value)
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    let items = UICheckboxAccessor.map.get(this.host.name),
      index;
    if (!items) return;

    index = items.indexOf(this);
    if (index >= 0) items.splice(index, 1);

    if (items.length == 0) {
      UICheckboxAccessor.map.delete(this.host.name);
    }
  }

  writeValue(value: string | number | boolean): void {
    let items = UICheckboxAccessor.map.get(this.host.name);
    items?.forEach((item) => {
      item.host.valueChange.emit(
        (item.host.value = item.host.onselect == value)
      );
      item.host.forceUpdate();
    });
  }
}

@Component({
  selector: "checkbox",
  template: `
    <input
      type="checkbox"
      [attr.name]="name || null"
      [value]="onselect"
      (click)="onChange($event)"
      tabindex="-1"
    />
    <span></span>
  `,
  styleUrls: ["./box.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: UICheckboxAccessor,
    },
  ],
})
export class UICheckboxComponent {
  @Input() name: string = "";
  @Input() onselect: string | boolean | number = makeid(5);

  //compatibility
  @Input() value: boolean = true;
  @Output() valueChange = new EventEmitter<boolean>();

  //action used in accessors
  @Output() selection = new EventEmitter<string | boolean | number>();

  constructor(private cd: ChangeDetectorRef) {}

  onChange(e: Event) {
    if (this.value) {
      this.valueChange.emit(this.value = true);
      this.selection.emit(undefined);
    } else {
      this.valueChange.emit((this.value = false));
      this.selection.emit(this.onselect);
    }
    this.cd.markForCheck();
  }

  forceUpdate() {
    this.cd.markForCheck();
  }
}
