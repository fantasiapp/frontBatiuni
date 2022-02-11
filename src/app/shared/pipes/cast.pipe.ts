import { Pipe, PipeTransform } from "@angular/core";
import { Observable } from "rxjs";

@Pipe({
  name: 'cast',
  pure: true
})
export class CastPipe implements PipeTransform {
  transform<T>(value: number | T | Observable<T>, ...args: any[]) {
    return value as Observable<T>
  }
};