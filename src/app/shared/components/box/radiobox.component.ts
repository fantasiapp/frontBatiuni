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
  selector: "radiobox[formControlName]",
})
export class UIRadioboxAccessor extends UIDefaultAccessor<
  string | boolean | number
> {
  static map = new Map<string, UIRadioboxAccessor[]>();

  @Input("formControlName")
  controlName: string = "";

  subscription?: Subscription;
  constructor(cd: ChangeDetectorRef, private host: UIRadioboxComponent) {
    super(cd);
  }

  ngOnInit() {
    this.host.name = this.host.name || this.controlName;
    let items = UIRadioboxAccessor.map.get(this.host.name);
    if (!items) UIRadioboxAccessor.map.set(this.host.name, (items = []));
    items.push(this);

    this.subscription = this.host.selection.subscribe((next) => {
      const value = this.onChange(next);
      this.writeValue(value);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    let items = UIRadioboxAccessor.map.get(this.host.name),
      index;
    if (!items) return;

    index = items.indexOf(this);
    if (index >= 0) items.splice(index, 1);

    if (items.length == 0) {
      UIRadioboxAccessor.map.delete(this.host.name);
    }
  }

  writeValue(value: string | number | boolean): void {
    let items = UIRadioboxAccessor.map.get(this.host.name);
    items?.forEach((item) => {
      item.host.valueChange.emit(
        (item.host.value = item.host.onselect == value)
      );
      item.host.forceUpdate();
    });
  }
}

@Component({
  selector: "radiobox",
  template: `
    <input
      type="radio"
      [attr.name]="name || null"
      [value]="onselect"
      (click)="onChange($event)"
      [checked]="value || null"
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
      useExisting: UIRadioboxAccessor,
    },
  ],
})
export class UIRadioboxComponent {
  @Input() name: string = "";
  @Input() onselect: string | boolean | number = makeid(5);

  //compatibility
  @Input() value: boolean = false;
  @Output() valueChange = new EventEmitter<boolean>();

  //action used in accessors
  @Output() selection = new EventEmitter<string | boolean | number>();

  constructor(private cd: ChangeDetectorRef) {}

  onChange(e: Event) {
    if (this.value) {
      this.valueChange.emit(this.value = false);
      this.selection.emit(undefined);
    } else {
      this.valueChange.emit((this.value = true));
      this.selection.emit(this.onselect);
    }
    this.cd.markForCheck();
  }

  forceUpdate() {
    this.cd.markForCheck();
  }
}
