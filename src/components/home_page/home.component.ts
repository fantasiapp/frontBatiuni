import { Component, ChangeDetectionStrategy } from "@angular/core";
import { Select } from "@ngxs/store";
import { BehaviorSubject, Observable } from "rxjs";
import { DistanceSliderConfig, SalarySliderConfig } from "src/common/config";
import { User } from "src/models/User/user.model";
import { UserState } from "src/models/User/user.state";

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  
  @Select(UserState)
  user$!: Observable<User>;

  ngOnInit() {
    this.user$.subscribe(console.log);
  }
  
  activeView: number = 0;
  annonces = new Array(10);

  openAdFilterMenu: boolean = false;

  imports = { DistanceSliderConfig, SalarySliderConfig };
};