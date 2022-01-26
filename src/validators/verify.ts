import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { lowerCase, upperCase } from "./regex";

export const MatchField = (target: string): ValidatorFn => {
  return (control: AbstractControl) => {
    const original = control.parent?.get(target)

    return original && control.value == original.value ? null : {
      FIELD_MISMATCH: ['email']
    };
  };
};

export const ComplexPassword = () => {
  return (control: AbstractControl) => {
    let content = control?.value,
      errors: ValidationErrors = {};
            
    if ( content.length < 8 ) errors['MIN_LENGTH'] = [];
    if ( !content.match(lowerCase) ) errors['CASE'] = ['miniscule'];
    else if ( !content.match(upperCase) ) errors['CASE'] = ['majuscule'];
    return Object.keys(errors).length ? errors : null;
  }
};

export const RequiredType = (type: string, error: string, ...args: string[]) => {
  return (control: AbstractControl) => {
    let content = control.value,
    errors: ValidationErrors = {};

    if ( typeof content != type )
      errors[error] = args;
    return Object.keys(errors).length ? errors : null;
  }
};

export const setErrors = (form: AbstractControl, errors: ValidationErrors | null) => {
  if ( !errors ) return;
  if ( errors.all ) form.setErrors({server: errors.all});
  let errorFields = Object.keys(errors).filter(field => field != 'all');
  for ( let field of errorFields ) {
    form.get(field)?.setErrors({server: errors[field]});
  }
};