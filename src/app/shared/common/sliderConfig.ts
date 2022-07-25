import { Options } from "@angular-slider/ngx-slider";
import { footerTranslate } from "src/animations/footer.animation";

export const DistanceSliderConfig: Options = {
    floor: 0,
    ceil: 2000,
    step: 10,
    showSelectionBar: true,
    translate(value: number): string {
      return value + ' KM';
    }
}  

let salaryFloor = 0;
let salaryCeil = 100000;

export const SalarySliderConfig: Options = {
  floor: salaryFloor,
  ceil: salaryCeil,
  
  showSelectionBar: true,

  customPositionToValue(position: number): number {
    // compute the value of a slider (floor to ceil) given its position (0 to 1)
    // this function must be strictly increasing
    let numSubdivisions = Math.ceil(Math.log10(salaryCeil)) - 2;

    if (position <= 1/numSubdivisions) {
      return Math.round((position * (1000)/(1/numSubdivisions))/10)*10;
    }
    else {
      let subdivisionPosition = Math.floor(position * (numSubdivisions)) + 1;
      let m = numSubdivisions * (10**(subdivisionPosition+2) - 10**(subdivisionPosition+1));
      let p = 10**(subdivisionPosition+1) - m * (subdivisionPosition-1)/numSubdivisions ;
      return Math.round((m*position + p)/(10**(subdivisionPosition))) * (10**(subdivisionPosition));
    }
  },

  customValueToPosition(value: number): number {
    // compute the position of a slider (0 to 1) given its value (floor to ceil)
    // this function must be strictly increasing

    let numSubdivisions = Math.ceil(Math.log10(salaryCeil)) - 2;
    if (value <= 1000) {
      return value / (1000) * (1/numSubdivisions);
    }
    else {
      let subdivisionPosition = Math.ceil(Math.log10(value)) - 2;
      let m = 1/numSubdivisions /(10**(subdivisionPosition+2) - 10**(subdivisionPosition+1));
      let p = (subdivisionPosition-1)/numSubdivisions - 1/numSubdivisions/9;
      return m * value + p;
    }
  },

  translate(value: number): string {
    return value + ' €';
  }
};

export const SOSSalarySliderConfig: Options = {
  floor: 0,
  ceil: 400,
  showSelectionBar: true,
  translate(value: number): string {
    return value + ' €';
  }
}

export const EmployeesSliderConfig: Options = {
  floor: 0,
  ceil: 100,
  translate(value: number): string{
    if (value == 0) return value + ""
    if (value == 1) return value + "employé"
    return (value == 100 ? value + "+" : value)+" employés"
  }
}