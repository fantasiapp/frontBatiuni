import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Mobile } from 'src/app/shared/services/mobile-footer.service';
import { TaskGraphic } from '../suivi_chantier_date-content/suivi_chantier_date-content.component';

@Component({
  selector: 'app-supervision-wrapper',
  templateUrl: './supervision-wrapper.component.html',
  styleUrls: ['./supervision-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Mobile]
})
export class SupervisionWrapperComponent implements OnInit {

  @Input() taskGraphic: TaskGraphic | null = null

  showFooter: boolean = true;


  constructor(public mobile: Mobile, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.mobile.init()
    this.mobile.footerStateSubject.subscribe(b => {
      console.log('fasdf', b);
      this.showFooter = b
      this.cd.detectChanges()
    })
  }

}
