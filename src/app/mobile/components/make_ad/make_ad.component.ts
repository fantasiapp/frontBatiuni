import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs/internal/Observable";
import { Mobile } from "src/app/shared/services/mobile-footer.service";
import { Profile } from "src/models/new/data.interfaces";
import { DataQueries, DataState } from "src/models/new/data.state";
import { ChangeProfileType } from "src/models/new/user/user.actions";

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

  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  @Select(DataState.view)
  view$!: Observable<'PME' | 'ST'>;

  @Input() page: boolean = true;
  @Input() withSubmit: boolean = false;
  showFooter: boolean = true;

  constructor(public mobile: Mobile, private cd: ChangeDetectorRef, private store: Store){
  }

  ngOnInit(){
    this.mobile.footerStateSubject.subscribe(b => {
      this.showFooter = b;
      this.cd.detectChanges()
    })
  }

  ngOnDestroy(){
  }

  isPmeSwitch: boolean = true
  changeProfileType(type: boolean) {
    this.isPmeSwitch = type
    this.store.dispatch(new ChangeProfileType(type));
  }
};