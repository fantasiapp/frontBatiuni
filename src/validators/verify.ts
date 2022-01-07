import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { lowerCase, upperCase } from "./regex";

export const MatchField = (field: string, verification: string): ValidatorFn => {
  return (control: AbstractControl) => {
    const original = control.get(field),
      verified = control.get(verification);

    verified  && verified.setErrors(original && verified.value == original.value ? null : {
      emailMismatch: true
    });
      
    return null;
  };
};


export const ComplexPassword = (fieldName: string): ValidatorFn => {
  return (control: AbstractControl) => {
    let field = control.get(fieldName),
      content = field?.value,
      errors: ValidationErrors = {};
    
    if ( !field ) return null;
    
    if ( content.length < 8 ) errors['minlength'] = true;
    if ( !content.match(lowerCase) ) errors['lowercase'] = true;
    if ( !content.match(upperCase) ) errors['uppercase'] = true;
    field.setErrors(Object.keys(errors).length ? errors : null);
    return null;
  }
};

export const setErrors = (form: AbstractControl, errors: ValidationErrors | null) => {
  if ( !errors ) return;
  if ( errors.all ) form.setErrors({server: errors.all});
  let errorFields = Object.keys(errors).filter(field => field != 'all');
  for ( let field of errorFields )
    form.get(field)?.setErrors({server: errors[field]});
};