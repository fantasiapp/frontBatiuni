import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'space'})
export class SpacingPipe implements PipeTransform {
  transform(value: any, each: number = 2, by: number = 1) {
    const str = (value || '').toString().replace(/\s/g, '') as string;
    let result = '';
    
    for ( let i = 0; i < str.length - 1; i++ ) {
      result += str[i];
      if ( (i+1) % each == 0 ) result += ' '.repeat(by);
    }

    if ( str ) result += str[str.length - 1];
    return result;
  }
}