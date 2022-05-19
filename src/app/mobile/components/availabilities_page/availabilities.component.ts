import { ChangeDetectionStrategy, Component, ViewChild } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AppComponent } from "src/app/app.component";
import { Destroy$ } from "src/app/shared/common/classes";
import { Availability, CalendarUI, DayState } from "src/app/shared/components/calendar/calendar.ui";
import { SwipeupService, SwipeupView } from "src/app/shared/components/swipeup/swipeup.component";
import { Profile } from "src/models/new/data.interfaces";
import { nameToAvailability } from "src/models/new/data.mapper";
import { DataQueries } from "src/models/new/data.state";
import { ModifyAvailability } from "src/models/new/user/user.actions";

@Component({
  selector: 'availabilities',
  templateUrl: './availabilities.component.html',
  styleUrls: ['./availabilities.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailabilitiesComponent extends Destroy$ {
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
      this.submit(this.calendar);
    }
  }, {
    name: 'Disponible sous-conditions',
    class: 'sous-conditions',
    click: () => {
      this.setCalendarDayState('availablelimits');
      this.submit(this.calendar);
    }
  }, {
    name: 'Non renseigné',
    class: 'non-renseigne',
    click: () => {
      this.setCalendarDayState('nothing');
      this.submit(this.calendar);
    },
  }]

  constructor(private store: Store, private swipeupService: SwipeupService, private appComponent: AppComponent) {
    super();
  }

  currentAvailability: Availability = 'nothing';

  ngOnInit() {
    this.profile$.pipe(takeUntil(this.destroy$)).subscribe(profile => {
      this.availabilities =
        this.store.selectSnapshot(DataQueries.getMany('Disponibility', profile.company.availabilities))
          .map(availability => ({date: availability.date, availability: nameToAvailability(availability.nature as any)}));
      
        const now = (new Date).toISOString().slice(0, 10);
        this.currentAvailability = this.availabilities.find(day => day.date == now)?.availability || 'nothing';
    });
  }

  ngAfterViewInit() {
    this.appComponent.updateUserData()
  }

  submit(calendar: CalendarUI) {
    this.store.dispatch(ModifyAvailability.fromCalendar(calendar));
  }

  onDayClicked(_: [MouseEvent, DayState[]]) {
    this.swipeupService.show({
      type: 'menu',
      items: this.items,
      hideOnClick: true
    });
  }
  
  //all changes are sent to the server only after the component is destroyed
  private setCalendarDayState(state: Availability) {
    this.calendar.setCurrentDayState(state);
    const now = (new Date).toISOString().slice(0, 10),
      updatedDate = this.calendar.selection[0];
    if ( now == updatedDate )
      this.currentAvailability = state;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}