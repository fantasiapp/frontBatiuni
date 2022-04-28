import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { Mobile } from "src/app/shared/services/mobile-footer.service";

@Component({
  selector: 'post',
  templateUrl: './make_ad.component.html',
  styleUrls: ['./make_ad.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MakeAdComponent {
  imports = {
    currencies: ['$', '€', '£']
  }

  @Input() page: boolean = true;
  @Input() withSubmit: boolean = false;
  showFooter: boolean = true;

  constructor(public mobile: Mobile, private cd: ChangeDetectorRef){
  }

  ngOnInit(){
    this.mobile.footerStateSubject.subscribe(b => {
      this.showFooter = b;
      this.cd.detectChanges()
    })
  }

  ngOnDestroy(){
  }
};