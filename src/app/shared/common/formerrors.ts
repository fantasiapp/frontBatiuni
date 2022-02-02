import { ChangeDetectionStrategy, Component, ComponentFactoryResolver, Directive, HostBinding, Inject, InjectionToken, Input, ViewContainerRef } from "@angular/core";
import { NgControl } from "@angular/forms";
import { takeUntil } from "rxjs/operators";
import { Destroy$ } from "./classes";

const forms = {
  FIELD_MISMATCH: '$1 doit être identique$2=().',
  REQUIRED_FIELD: '$1=(Le champ) est obligatoire.',
  MIN_LENGTH: '$2=(Le champ) doit contenir au moins $1=(8) caractères',
  CASE: '$2=(Le champ) doit contenir une lettre en $1=(miniscule)',
  INVALID_FORMAT: 'Le format $1<() est invalide',
  MESSAGE: '$1',
  //server: '$1'
};

export function getFormErrorTemplate(name: string) {
  const formAsObject = forms as any;
  if ( formAsObject.hasOwnProperty(name) )
    return formAsObject[name];
  return null;
};

const arg_expr = /\$(?:\!|(\d+))(?:(\<|\=)\((.*?)\))?/g;
export function build(template: string, ...args: string[]) {
  arg_expr.lastIndex = 0; //reset regexp
  let output = '', lastMatch: any = null;
  while ( true ) {
    const match = arg_expr.exec(template);
    if ( !match ) break;
    const index = +(match[1]),
      def = match[3],
      arg = Number.isNaN(index) ? '$' : (index ? args[index-1] : template),
      deleteLast = (match[2] == '<') && !arg,
      val = arg || def;
    
    if ( val === void 0 ) throw `Unable to evaluate template ${template}. Missing argument or default value.`;
    output += template.slice(lastMatch ? lastMatch.index + lastMatch[0].length : 0, match.index - (+deleteLast)) + val;
    lastMatch = match;
  }

  output += template.slice(lastMatch ? lastMatch.index + lastMatch[0].length : 0);
  return output;
};

@Component({
  selector: 'error-message',
  template: `
    {{ message }}
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorMessageComponent {
  @HostBinding('class') get classes() { return 'error'; }
  message: string = '';
}

@Directive ({
  selector: '[formControlName]'
})
export class ControlErrorsDirective extends Destroy$ {
  constructor(private control: NgControl, private view: ViewContainerRef, private resolver: ComponentFactoryResolver) {
    super();
  }

  @Input('novalidate')
  novalidate: boolean = false;

  displayErrors() {
    this.view.clear();
    const errors = this.control.errors;
    if ( !errors ) return;
    const errorNames = Object.keys(errors);
    for ( const name of errorNames ) {
      const template = getFormErrorTemplate(name);
      if ( template == null ){
        console.warn(`Unknown form error "${name}"`);
        return;
      }
      let err = build(template, ...errors[name]);
      const factory = this.resolver.resolveComponentFactory(ErrorMessageComponent),
        component = this.view.createComponent(factory);
      
      component.instance.message = err;
    }
  }

  ngOnInit() {
    if ( this.novalidate ) return;

    this.control.statusChanges
      ?.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.displayErrors();
      });
    
    if ( this.control.value )
      this.displayErrors();
  }
};

//put directive on form for field errors