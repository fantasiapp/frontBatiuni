import { ChangeDetectionStrategy, Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject, fromEvent, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { Availability, CalendarUI, DayState } from "src/app/shared/components/calendar/calendar.ui";
import { SwipeupService } from "src/app/shared/components/swipeup/swipeup.component";
import { TooltipDimension, UITooltipService } from "src/app/shared/components/tooltip/tooltip.component";
import { ModifyDisponibility } from "src/models/user/user.actions";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";

@Component({
  selector:"dispo-page",
  templateUrl:'dispo.page.html',
  styleUrls:['dispo.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DispoPage extends Destroy$ {
  @Select(UserState)
  user$!: Observable<User>;

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
  }];

  @ViewChild('calendar', {read: CalendarUI, static: false})
  calendar!: CalendarUI;

  dimension: TooltipDimension = {
    left: '0', top: '0',
    width: '300px', height: '150px' 
  };

  constructor(private store: Store, private tooltipService: UITooltipService) {
    super();
    
  }

  private getDimensionFromEvent(e: MouseEvent) {
    const ev = e,
      pageX = Math.min(ev.pageX, window.innerWidth - 300),
      pageY = Math.min(ev.pageY, window.innerHeight - 200);
    
    return {
      ...this.dimension,
      left: pageX + 'px', top: pageY + 'px'
    };
  }
  
  submit(calendar: CalendarUI) {
    this.store.dispatch(ModifyDisponibility.fromCalendar(calendar));
  }

  onDayClicked([ev, _]: [MouseEvent, DayState]) {
    this.tooltipService.reshape(this.dimension = this.getDimensionFromEvent(ev));
    this.tooltipService.show({
      type: 'menu',
      items: this.items,
      hideOnClick: true,
      class: 'availability-picker'
    });
  }

  private setCalendarDayState(state: Availability) {
    this.calendar.setCurrentDayState(state);
  }
}