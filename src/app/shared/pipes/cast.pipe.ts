import { Pipe, PipeTransform } from "@angular/core";
import { Observable, of } from "rxjs";

@Pipe({
  name: 'cast',
  pure: true
})
export class CastPipe implements PipeTransform {
  transform<T>(value: number | T | Observable<T>, ...args: any[]): Observable<T> {
    return value instanceof Observable ? value : of(value) as Observable<T>;
  }
};

@Pipe({
  name: 'snapshot',
  pure: true
})
export class SnapshotPipe implements PipeTransform {
  transform<T>(value: number | T | Observable<T>, ...args: any[]): T {
    return value as T;
  }
};