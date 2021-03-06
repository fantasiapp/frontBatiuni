import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { lowerCase, number, phone, upperCase, url } from "./regex";

export const MatchField = (target: string, filed: string = target, ignoreCase: boolean = false): ValidatorFn => {
  return (control: AbstractControl) => {
    const original = control.parent?.get(target),
      originalValue = original && (ignoreCase ? original.value.toLowerCase() : original.value),
      controlValue = ignoreCase ? control.value.toLowerCase() : control.value;

    return original && originalValue == controlValue ? null : {
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
          
    if ( content && content.length < 8 ) errors['MIN_LENGTH'] = [];
    if ( content && !content.match(lowerCase) ) errors['CASE'] = ['miniscule'];
    else if ( content && !content.match(upperCase) ) errors['CASE'] = ['majuscule'];
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

export const FieldType = (type: 'phone' | 'number' | 'url' | 'positiveNumber', messages?: string[]) => {
  return (control: AbstractControl) => {
    let content = control.value,
    errors: ValidationErrors = {};
    const regexNumber = /[^0-9]/g

    if ( !content ) return {};

    if ( type == 'number' || type == "positiveNumber" ) {
      if ( !((typeof content == 'number') || !content.match(regexNumber)) )
        errors['FIELD_TYPE'] = messages || ['un nombre'];
      if ( type == "positiveNumber" && content == 0){
        errors['FIELD_TYPE'] = messages || ['un nombre non nul'];
      }
      if(messages && messages[0] == "un num??ro de SIRET" && content.length != 14) errors['FIELD_TYPE'] = ['un num??ro de SIRET']
    } else if ( type == 'phone' ) {
      if ( !content.replace(/\s/g, '').match(phone))
        errors['FIELD_TYPE'] = messages || ['un num??ro de t??l??phone'];
    } else {
      if ( !content.match(url) )
        errors['FIELD_TYPE'] = messages || ['un site web'];
    }
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