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


export const SalarySliderConfig: Options = {
  floor: 1,
  ceil: 400,
  
  showSelectionBar: true,
  translate(value: number): string {
    return value + ' €';
  }
};