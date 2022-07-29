import { transition, trigger } from "@angular/animations";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { FadeIn } from "src/animations/fade.animation";
import { footerTranslate } from "src/animations/footer.animation";
import { Destroy$ } from "src/app/shared/common/classes";
import { Mobile } from "src/app/shared/services/mobile-footer.service";

@Component({
  selector: 'main-page',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Mobile],
  animations: [
    trigger('routeAnimation', [
      transition("* => *", FadeIn)
    ]), footerTranslate
  ]
  // animations: footerTranslate
})
export class MainPage extends Destroy$ {
  showFooter: boolean = true;
  constructor(public mobile: Mobile, private cd: ChangeDetectorRef) {
    super()
  }

  ngOnInit(){
    this.mobile.footerStateSubject.pipe(takeUntil(this.destroy$)).subscribe(b => {
      this.showFooter = b
      this.cd.markForCheck();
      // this.cd.detectChanges()
    })
    this.mobile.init()
  }


  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
};