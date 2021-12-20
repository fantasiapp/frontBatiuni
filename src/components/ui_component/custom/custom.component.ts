import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Option } from "src/components/options/options";

let options: Option[] = [
  {id: 0, name: "hello", checked: false},
  {id: 1, name: "world", checked: false}
];

@Component({
  selector: 'custom',
  template: `
    <form [formGroup]="form">
      <number formControlName="number"></number>
      <br/>
      <box formControlName="check"></box>
      <box type="radio" formControlName="radio"></box>
      <switch formControlName="switch"></switch>
      <options [options]="options" formControlName="options"></options>
    </form>
  `,
  styleUrls: ['./custom.component.scss']
})
export class CustomComponent {
  form = new FormGroup({
    number: new FormControl(0),
    check: new FormControl(false),
    radio: new FormControl(true),
    switch: new FormControl(false),
    options: new FormControl([])
  });

  options = options;

  constructor() {
    this.form.valueChanges.subscribe(() => {
      console.log(this.form.value);
    })
  }
};