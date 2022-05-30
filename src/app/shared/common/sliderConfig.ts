import { Options } from "@angular-slider/ngx-slider";

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
      return position * (1000)/(1/numSubdivisions);
    }
    else {
      let subdivisionPosition = Math.floor(position * (numSubdivisions)) + 1;
      console.log(subdivisionPosition);
      let m = numSubdivisions * (10**(subdivisionPosition+2) - 10**(subdivisionPosition+1));
      let p = subdivisionPosition/numSubdivisions - m * 10**(subdivisionPosition+1);
      p = 0;
       console.log(m, p)
      console.log(m*position + p)
      return salaryCeil
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