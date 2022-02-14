import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'spread',
  pure: false
})
export class SpreadPipe implements PipeTransform {
  transform(value: Map<any, any>, ...args: any[]) {
    return [...value.values()];
  }
}