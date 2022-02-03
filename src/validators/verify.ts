import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { lowerCase, upperCase } from "./regex";

export const MatchField = (target: string, filed: string = 'email'): ValidatorFn => {
  return (control: AbstractControl) => {
    const original = control.parent?.get(target)

    return original && control.value == original.value ? null : {
      FIELD_MISMATCH: [filed]
    };
  };
};

export const Required = (fieldname: string = '') => {
  return (control: AbstractControl) => {
    let content = control?.value,
      errors: ValidationErrors = {};
            
    if ( !content ) errors['REQUIRED_FIELD'] = fieldname ? [fieldname] : [];
    return Object.keys(errors).length ? errors : null;
  }
}

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

export const Regexp = (regexp: RegExp, error: string, args: any[]) => {
  return (control: AbstractControl) => {
    let content = control.value,
    errors: ValidationErrors = {};

    if ( !content.match(regexp) )
      errors[error] = args;
    return Object.keys(errors).length ? errors : null;
  }
};

export const TransferError = (to: string) => {
  return (control: AbstractControl) => {
    const target = control.parent?.get(to);

    if ( target ) target.setErrors(control.errors);
    return null;
  };
};

export const setErrors = (form: AbstractControl, errors: ValidationErrors | null) => {
  if ( !errors ) return;
  if ( errors.all ) form.setErrors({server: errors.all});
  let errorFields = Object.keys(errors).filter(field => field != 'all');
  for ( let field of errorFields ) {
    form.get(field)?.setErrors({MESSAGE: [errors[field]]});
  }
};