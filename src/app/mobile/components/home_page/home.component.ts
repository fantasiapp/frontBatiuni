import { Component, ChangeDetectionStrategy } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/common/classes";
import { DistanceSliderConfig, SalarySliderConfig } from "src/common/config";
import { AuthState } from "src/models/auth/auth.state";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent extends Destroy$ {
  
  @Select(UserState)
  user$!: Observable<User>;

  constructor(private store: Store) {
    super()
  }

  ngOnInit() {
    this.user$.pipe(takeUntil(this.destroy$)).subscribe(console.log);
    console.log(this.user$.subscribe(console.log))
    console.log(this.store.selectSnapshot(UserState))
  }
  
  activeView: number = 0;
  annonces = new Array(10);

  openAdFilterMenu: boolean = false;

  imports = { DistanceSliderConfig, SalarySliderConfig };
};