import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const VerifyField = (field: string, verifier: string): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const original = control.get(field),
      verified = control.get(verifier);

    return original && verified && verified.value == original.value ? {
      
    } : null;
  };
};