import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

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

const lowerCase = /[a-z]/;
const upperCase = /[A-Z]/;
const number = /[0-9]/;
const symbols = /\+|\-|\*|\_|\,|\;|\./;

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
}