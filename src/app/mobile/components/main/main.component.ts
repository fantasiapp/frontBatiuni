import { transition, trigger } from "@angular/animations";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { FadeIn } from "src/animations/fade.animation";
import { footerTranslate } from "src/animations/footer.animation";
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
export class MainPage {
  showFooter: boolean = true;
  constructor(public mobile: Mobile, private cd: ChangeDetectorRef) {
  }

  ngOnInit(){
    this.mobile.footerStateSubject.subscribe(b => {
      this.showFooter = b
      this.cd.detectChanges()
    })
    this.mobile.init()
  }


  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
};