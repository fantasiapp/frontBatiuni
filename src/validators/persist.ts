import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { email } from "./regex";

export type PersistValidatorFn = ValidatorFn;

export const Email = (control: AbstractControl) => {
  //persist the server error
  console.log(control.value, control.errors)
  let content = control.value,
    errors: ValidationErrors = control.errors?.server ? {server: control.errors.server} : {};
  
  if ( !content ) return null;
  if ( !content.match(email) ) errors['email'] = 'Format e-mail invalide.';
  return Object.keys(errors).length ? errors : null
}