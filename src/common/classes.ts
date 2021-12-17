import { Directive } from "@angular/core";
import { Subject } from "rxjs";

@Directive()
export class Destroy$ {
  protected destroy$ = new Subject<void>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}