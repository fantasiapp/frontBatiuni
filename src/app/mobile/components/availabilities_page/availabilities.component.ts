import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { Availability, CalendarUI } from "src/app/shared/components/calendar/calendar.ui";
import { ModifyDisponibility } from "src/models/user/user.actions";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";

@Component({
  selector: 'availabilities',
  templateUrl: './availabilities.component.html',
  styleUrls: ['./availabilities.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailabilitiesComponent {

  @Select(UserState)
  user$!: Observable<User>;

  constructor(private store: Store) {
    this.user$.subscribe(user => {
      console.log(user.profile!.company.disponibilities);
    })
  }

  submit(calendar: CalendarUI) {
    this.store.dispatch(ModifyDisponibility.fromCalendar(calendar));
  }
  
  setCalendarDayState(calendar: CalendarUI, state: Availability) {
    calendar.setCurrentDayState(state);
  }
}