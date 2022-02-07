import { ChangeDetectionStrategy, Component, ViewChild } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { Availability, CalendarUI } from "src/app/shared/components/calendar/calendar.ui";
import { SwipeupService } from "src/app/shared/components/swipeup/swipeup.component";
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

  @ViewChild('calendar', {read: CalendarUI, static: false})
  calendar!: CalendarUI;

  private items = [{
    name: 'Disponible',
    class: 'disponible',
    click: () => {
      this.setCalendarDayState('available');
    }
  }, {
    name: 'Disponible sous-conditions',
    class: 'sous-conditions',
    click: () => {
      this.setCalendarDayState('availablelimits');
    }
  }, {
    name: 'Pas disponible',
    class: 'pas-disponible',
    click: () => {
      this.setCalendarDayState('unavailable');
    }
  }, {
    name: 'Non renseigné',
    class: 'non-renseigne',
    click: () => {
      this.setCalendarDayState('nothing');
    },
  }]

  constructor(private store: Store, private swipeupService: SwipeupService) {

  }

  submit(calendar: CalendarUI) {
    this.store.dispatch(ModifyDisponibility.fromCalendar(calendar));
  }

  onDayClicked() {
    this.swipeupService.show({
      type: 'menu',
      items: this.items,
      hideOnClick: true
    });
  }
  
  private setCalendarDayState(state: Availability) {
    this.calendar.setCurrentDayState(state);
  }
}