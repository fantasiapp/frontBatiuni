import { ChangeDetectionStrategy, Component, ViewChild } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { Availability, CalendarUI, DayState } from "src/app/shared/components/calendar/calendar.ui";
import { SwipeupService } from "src/app/shared/components/swipeup/swipeup.component";
import { Profile } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";
import { ModifyDisponibility } from "src/models/new/user/user.actions";

@Component({
  selector: 'availabilities',
  templateUrl: './availabilities.component.html',
  styleUrls: ['./availabilities.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailabilitiesComponent {
  @ViewChild('calendar', {read: CalendarUI, static: false})
  calendar!: CalendarUI;

  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  availabilities: DayState[] = [];

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

  ngOnInit() {
    this.profile$.subscribe(profile => {
      this.availabilities =
        this.store.selectSnapshot(DataQueries.getMany('Disponibility', profile.company.availabilities))
          .map(availability => ({date: availability.date, availability: availability.nature as Availability}));
    });
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