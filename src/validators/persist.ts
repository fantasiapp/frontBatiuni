import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { email } from "./regex";

export type PersistValidatorFn = ValidatorFn;

export const Email = () => {
  let lastValue: any = null;
  return (control: AbstractControl) => {
    //persist the server error
    let content = control.value,
      errors: ValidationErrors = {};
    
    if ( lastValue === content && control.errors )
      errors = control.errors;
    
    lastValue = content;
    if ( !content ) return null;
    if ( !content.match(email) ) errors['INVALID_FORMAT'] = ['e-mail'];
    return Object.keys(errors).length ? errors : null
  };
};

export const HoldError = (validator: ValidatorFn) => {
  let lastValue: any = null;
  return (control: AbstractControl) => {
    //persist the server error
    let content = control.value,
      oldErrors: ValidationErrors | null = lastValue === content ? control.errors : null,
      newErrors: ValidationErrors | null = validator(control) || {};
    
    lastValue = content;
    if ( !oldErrors ) return newErrors;
    if ( !newErrors ) return oldErrors;
    return {...oldErrors, ...newErrors};
  };
};