import { LabelType, Options } from "@angular-slider/ngx-slider";

export const DistanceSliderConfig: Options = {
  floor: 1,
  ceil: 100,
  showSelectionBar: true,
  translate(value: number, label: LabelType): string {
    return value + ' KM';
  }
};

export const SalarySliderConfig: Options = {
  floor: 1,
  ceil: 100000,
  
  showSelectionBar: true,
  translate(value: number, label: LabelType): string {
    return value + ' €';
  }
};