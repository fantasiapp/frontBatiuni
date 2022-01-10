import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { email } from "./regex";

export type PersistValidatorFn = ValidatorFn;

const map = new Map<AbstractControl, string>();

export const Email = (control: AbstractControl) => {
  //persist the server error
  let content = control.value,
    errors: ValidationErrors = {};
  
  if ( map.get(control) === content && control.errors )
    errors = control.errors;

  map.set(control, content);
  if ( !content ) return null;
  if ( !content.match(email) ) errors['email'] = 'Format e-mail invalide.';
  return Object.keys(errors).length ? errors : null
};
