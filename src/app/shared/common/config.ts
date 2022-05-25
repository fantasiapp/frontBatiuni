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
  ceil: 100000,
  
  showSelectionBar: true,

  customPositionToValue(position: number): number {
    switch (true) {
      case position <= 1/3:
        return position * (1000 - 1)/(1/3) + 1;
      case position <= 2/3:
        return position * (10000-1000)/(1/3) - 8000;
      case position <= 1:
        return position * (100000-10000) / (1/3) - 170000;
    }
    return 0;
  },

  customValueToPosition(value: number): number {
    switch (true) {
      case value <= 1000:
        return value / (1000 - 1) * (1/3);
      case value <= 10000:
        return (value - 1000) / (10000 - 1000) * (1/3) + 1/3;
      case value <= 100000:
        return (value - 10000) / (100000 - 10000) * (1/3) + 2/3;
    }
    return 0;
  },


  translate(value: number): string {
    return value + ' €';
  }
};