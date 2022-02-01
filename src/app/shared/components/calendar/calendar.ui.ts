import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { UIDefaultAccessor } from '../../common/classes';
import * as moment from 'moment';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { filterSplit } from '../../common/functions';

export type Availability = 'available' | 'availablelimits' | 'unavailable' | 'selected' | 'nothing';
export interface DayState {
  date: string;
  availability: Availability;
};

@Component({
  selector: 'calendar',
  templateUrl: './calendar.ui.html',
  styleUrls: ['./calendar.ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: CalendarUI
  }],
  host: {
    class: 'flex center'
  }
})
export class CalendarUI extends UIDefaultAccessor<DayState[]> {

  @Input()
  embedded: boolean = true;

  week: any = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche"
  ];

  monthSelect: any[] = [];
  dateSelect: any;
  currentDay: any;
  currentMonth: number = 0;
  currentYear: number = 0;
  dayClicked: boolean = false;

  constructor(cd: ChangeDetectorRef) {
    super(cd);
    let now = new Date(Date.now());
    this.currentMonth = (now.getMonth()) + 1;
    this.currentYear = now.getFullYear();
  }

  private fillZero(month: number) {
    if ( month < 10 ) return '0' + month;
    return month;
  };

  getDaysFromDate(month: any, year: any) {
    const startDate = moment.utc(`${year}/${month}/01`,"YYYY-MM-DD")
    const endDate = startDate.clone().endOf('month')
    this.dateSelect = startDate.locale('fr');
    const diffDays = endDate.diff(startDate, 'days', true)
    const numberDays = Math.round(diffDays);
    const arrayDays = Object.keys([...Array(numberDays)]).map((a: any,i) => {
      a = this.fillZero(parseInt(a) + 1);
      const dayObject = moment(`${year}/${month}/${a}`,"YYYY-MM-DD");
      const compareDate = moment(`${year}-${month}-${a}`,"YYYY-MM-DD");
      let flow :any = compareDate;
      let item = this._value!.filter(item => item.date == flow._i)
      return {
        name: dayObject.format("dddd"),
        value: a,
        date: flow._i,
        indexWeek: dayObject.isoWeekday(),
        availability : item[0]?.availability
      };
    }); this.monthSelect = arrayDays;
    console.log(this.monthSelect);
  }
  
  get value() { return this._value; }
  set value(v: DayState[] | undefined) {
    this._value = v || [];
    this.getDaysFromDate(this.fillZero(this.currentMonth), this.currentYear);
  }

  changeMonth(flag: any) {
    const nextDate = flag < 0 ? this.dateSelect.clone().subtract(1, "month") : this.dateSelect.clone().add(1, "month");
    this.currentMonth = nextDate.get('M') + 1; this.currentYear = nextDate.get('Y');
    this.getDaysFromDate(this.fillZero(this.currentMonth), this.currentYear);
  }

  lastClick: any;

  onDayClicked(day: string, e: Event) {
    this.dayClicked = true;
    this.choseDay(day, e);
  }

  choseDay(day: any, e: Event) {
    this.lastClick = e;
    this.currentDay = day;

    if ( !this.embedded )
      this.toggleDayState(this.currentDay, 'selected');  
  }

  private setDOMState(state: Availability | null) {
    const target = this.lastClick.target as HTMLInputElement;
    let others = ['available', 'availablelimits', 'unavailable', 'selected'];
    if ( state ) others = others.filter(item => item != state)
    for (let i = 0; i < others.length; i++)
      target.classList.remove(`${others[i]}`);
    
    if ( state ) target.classList.add(`${state}`);
  }

  setCurrentDayState(state: Availability) {
    console.log(this.value, this._value);
    const remaining = this.value!.filter(item => item.date !== this.currentDay.date);
    let next;
    if (state != 'nothing') {
      next  = [...remaining, {
        date: this.currentDay.date,
        availability: state  
      }];
      this.setDOMState(state);
    }
    else {
      next = remaining;
      this.setDOMState(null);
    }
    
    this.onChange(next);
    this.dayClicked = false;
  }

  toggleDayState(day: DayState, targetState: Availability) {
    const [[current], remaining] = filterSplit(this.value!, (item) => item.date == day.date);
    let next;
    if ( current ) {
      next = remaining;
      this.setDOMState(null);
    } else {
      next = [...remaining, {
        date: this.currentDay.date,
        availability: targetState  
      }];
      this.setDOMState(targetState);
    }

    this.onChange(next);
  };

  //write value
}