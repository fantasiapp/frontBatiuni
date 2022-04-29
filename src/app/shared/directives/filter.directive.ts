import { Directive, Injectable, Output, EventEmitter } from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { debounceTime, takeUntil } from "rxjs/operators";
import { Destroy$ } from "../common/classes";
import { FilterService } from "../services/filter.service";
import { Record } from '../../../models/new/data.interfaces';

type KeyOf<T, ComputedProperties> = keyof T | keyof ComputedProperties;
type ValueOf<T, ComputedProperties, Key extends KeyOf<T, ComputedProperties> = KeyOf<T, ComputedProperties>> =
  Key extends keyof T ? T[Key] : Key extends keyof ComputedProperties ? ComputedProperties[Key] : never;

interface Compute<T, ComputedProperties, K extends keyof ComputedProperties = keyof ComputedProperties> {
  type: 'compute';
  name: K;
  get?: (t: T) => ComputedProperties[K];
};

interface Match<T, ComputedProperties, Key extends KeyOf<T, ComputedProperties> = KeyOf<T, ComputedProperties>> {
  type: 'match';
  name: Key; //keys are matched against formControl
};

interface Search<T, ComputedProperties, Key extends KeyOf<T, ComputedProperties> = KeyOf<T, ComputedProperties>> {
  type: 'search';
  name: Key; //keys are matched against formControl
};

interface If<T, ComputedProperties, Key extends KeyOf<T, ComputedProperties> = KeyOf<T, ComputedProperties>> {
  //applies condition on items
  type: 'if';
  name: Key;
  //force types inside functions that create those
  condition: (t: any, ...args: any[]) => boolean;
  otherwise?: T[];
  initialValue: boolean; //false by default
};

interface Sort<T, ComputedProperties, Key extends KeyOf<T, ComputedProperties> = KeyOf<T, ComputedProperties>> {
  type: 'sort';
  name: Key;
  comparaison: (u: any, v: any) => number;
};

interface Some<T, ComputedProperties> {
  name: string;
  type: 'some';
  items: Step<T, ComputedProperties>[];
}

interface Every<T, ComputedProperties> {
  name: string;
  type: 'every';
  items: Step<T, ComputedProperties>[];
};

export type Step<T = any, ComputedProperties = any> =
  Compute<T, ComputedProperties> | Match<T, ComputedProperties> | If<T, ComputedProperties> | Sort<T, ComputedProperties> | Some<T, ComputedProperties> | Every<T, ComputedProperties> | Search<T, ComputedProperties>;

export class AugmentedType<T extends {id: number}, ComputedProperties> {
  private cache: Record<Partial<ComputedProperties>> = {};
  private computedProperties: any = {}

  defineComputedProperty<K extends keyof ComputedProperties = keyof ComputedProperties>(name: K, get: Compute<T, ComputedProperties, K>['get']) {
    this.computedProperties = {...this.computedProperties, [name]: get};
  }

  getValue(item: T, step: Step<T, ComputedProperties>) {
    const isComputedProperty = !!this.computedProperties[step.name];
    if ( isComputedProperty ) {
      let entry = this.cache[item.id], name = step.name as keyof ComputedProperties;
      if ( !entry ) entry = this.cache[item.id] = {};
      if ( entry[name] !== void 0 ) return entry[name]; 
      else return entry[name] = this.computedProperties[step.name](item);
    }
    return item[step.name as keyof T];
  }

  //maybe cache values
};

@Directive()
export abstract class Filter<T extends {id: number}> extends Destroy$ {
  abstract name: string;

  constructor(private service: FilterService) {
    super();
  }

  input: T[] = [];
  private pipeline: Step<T, any>[] = [];
  private type = new AugmentedType<T, any>();
  public form!: FormGroup;

  protected create<ComputedProperties>(pipeline: Step<T, ComputedProperties>[]) {
    const form: any = {};
    for ( let i = 0; i < pipeline.length; i++ ) {
      const step = pipeline[i];
    
      if ( step.type != 'compute' ) {
        const control = this.createControl(step);
        form[step.type + '_' + step.name] = control;
        this.pipeline.push(step);
      }
    }
    
    const group = new FormGroup(form);
    this.form = group;
  }

  defineComputedProperty<ComputedProperties, K extends keyof ComputedProperties = keyof ComputedProperties>(name: K, get: Compute<T, ComputedProperties, K>['get']): Compute<T, ComputedProperties> {
    this.type.defineComputedProperty(name, get);
    return { type: 'compute', name, get };
  }

  protected match<ComputedProperties, K extends KeyOf<T, ComputedProperties>>(name: K): Match<T, ComputedProperties, K> {
    return { type: 'match', name }
  }

  protected search<ComputedProperties, K extends KeyOf<T, ComputedProperties>>(name: K): Search<T, ComputedProperties, K> {
    return { type: 'search', name }
  }

  protected onlyIf<ComputedProperties, K extends KeyOf<T, ComputedProperties>>(name: K, condition: (t: ValueOf<T, ComputedProperties, K>, ...args: any[]) => boolean, otherwise?: T[], initialValue: boolean = false): If<T, ComputedProperties> {
    return { type: 'if', name, condition, otherwise, initialValue }
  }

  protected sortBy<ComputedProperties, K extends KeyOf<T, ComputedProperties>>(name: K, comparaison: (u: ValueOf<T, ComputedProperties, K>, v: ValueOf<T, ComputedProperties, K>) => number): Sort<T, ComputedProperties> {
    return { type: 'sort', name, comparaison};
  }

  protected every<ComputedProperties>(name: string, ...args: Step<T, ComputedProperties>[]): Every<T, ComputedProperties> {
    return {
      name,
      type: 'every',
      items: args
    }
  }

  protected some<ComputedProperties>(name: string, ...args: Step<T, ComputedProperties>[]): Some<T, ComputedProperties> {
    return {
      name,
      type: 'some',
      items: args
    }
  }

  private createControl<ComputedProperties>(step: Step<T, ComputedProperties>) {
    if ( step.type == 'every' || step.type == 'some' ) {
      const array =  new FormArray([]);
      for ( const item of step.items )
        array.push(this.createControl(item));
      
      return array;
    } else {
      if ( step.type == 'if' )
        return new FormControl(step.initialValue || false);
      return new FormControl();
    }
  }

  ngOnInit() {
    this.service.add(this.name, this);
  }

  ngAfterViewInit() {
    this.form.valueChanges.pipe(debounceTime(0), takeUntil(this.destroy$)).subscribe(() => {
      this.update();
    });
  }

  ngOnDestroy() {
    this.service.remove(this.name);
    super.ngOnDestroy();
  }

  filter<ComputedProperties = any>(items: T[], providers: { [key in keyof ComputedProperties]?: (t: T) => ComputedProperties[key]; } = {}): T[] {
    for ( const key in providers )
      this.type.defineComputedProperty(key, providers[key]);
    
    this.input = items;
    return this.update();
  }

  private evaluateStep(input: T[], control: any, step: Step<T>) {
    const controlValue = control.value;
    let lastValue: Set<T>;
    console.log('evaluateStep', controlValue, step);
    switch ( step.type ) {
      case 'match':
        console.log("match input",input);
        console.log("match controlValue",controlValue);
        return input.filter(item => {
          return controlValue == this.type.getValue(item, step) || controlValue == "" || controlValue == null;
        });
      case 'search':
        return input.filter(item => {
          const value = this.type.getValue(item, step);
          if ( controlValue == null ) return true;
          if ( controlValue == "" ) return true;
          if ( typeof controlValue == 'string' ) {
            const search = controlValue.toLowerCase();
            return value.toLowerCase().indexOf(search) != -1;
          }
          return value == controlValue;
        });
      case 'if':
        if ( controlValue ) {
          const res = input.filter(item => step.condition(this.type.getValue(item, step), controlValue))
          return res;
        } else {
          return step.otherwise ? step.otherwise : input;
        }
      
      case 'sort':
        if ( controlValue ) return input.sort((item1, item2) =>
          step.comparaison(this.type.getValue(item1, step), this.type.getValue(item2, step))
        );
        break;
      
      case 'some':
        lastValue = new Set();
        for ( let i = 0; i < step.items.length; i++ )
          lastValue = new Set([...lastValue, ...this.evaluateStep(input, control.controls[i], step.items[i])]);
        return [...lastValue];
      
      case 'every':
        lastValue = new Set(input);
        for ( let i = 0; i < step.items.length; i++ ) {
          const newValue = this.evaluateStep(input, control.controls[i], step.items[i]);
          lastValue = new Set(newValue.filter(t => lastValue.has(t)));
        }

        return [...lastValue];
              
      default:
        break;
    }

    return input;
  }

  @Output('update')
  updateEvent = new EventEmitter<T[]>();

  update() {
    //emit and return
    const controls = this.form.controls;
    let input = this.input;
    
    console.log("updateEvent", input);
    console.log("pipeline", this.pipeline);
    console.log("form", this.form.value);
    console.log("controls", controls);
    console.log("Initial input", this.input);
    if ( !input.length ) return [];
    
    for ( const step of this.pipeline ) {
      const name = step.type + '_' + (step.name as string);
      console.log("controls[name].touched", name);
      input = this.evaluateStep(input, controls[name], step);
      console.log(input);
    }
    this.updateEvent.emit(input);
    return input;
  }
};