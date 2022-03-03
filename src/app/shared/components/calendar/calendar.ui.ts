import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Output, EventEmitter } from '@angular/core';
import { UIDefaultAccessor } from '../../common/classes';
import * as moment from 'moment';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { filterSplit } from '../../common/functions';

export type Availability = 'available' | 'availablelimits' | 'unavailable' | 'selected' | 'nothing';
export interface DayState {
  date: string;
  availability: Availability;
};

export type CalendarMode = 'range' | 'single';

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

  //à renommer ou à mettre à jour automatique une fois qu'on est une partie d'un form
  @Input()
  useEvents: boolean = true;

  @Input()
  mode: CalendarMode = 'single';

  private rangeStart: number | null = null;

  @Output()
  dayClick = new EventEmitter();

  week: any = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche"
  ];

  monthSelect: {
    name: string;
    value: any;
    date: any;
    indexWeek: number;
    availability: Availability;
  }[] = [];

  dateSelect: any;
  selection: string[] = [];
  currentMonth: number = 0;
  currentYear: number = 0;

  constructor(cd: ChangeDetectorRef) {
    super(cd);
    let now = new Date(Date.now());
    this.currentMonth = (now.getMonth()) + 1;
    this.currentYear = now.getFullYear();
    this.value = [];
  }

  private fillZero(month: number) {
    if (month < 10) return '0' + month;
    return month;
  };

  viewCurrentDate() {
    let now = new Date(Date.now());
    this.currentMonth = (now.getMonth()) + 1;
    this.currentYear = now.getFullYear();
    this.getDaysFromDate(this.fillZero(this.currentMonth), this.currentYear);
  }

  getDaysFromDate(month: any, year: any) {
    const startDate = moment.utc(`${year}/${month}/01`, "YYYY-MM-DD")
    const endDate = startDate.clone().endOf('month')
    this.dateSelect = startDate.locale('fr');
    const diffDays = endDate.diff(startDate, 'days', true)
    const numberDays = Math.round(diffDays);
    const arrayDays = Object.keys([...Array(numberDays)]).map((a: any, i) => {
      a = this.fillZero(parseInt(a) + 1);
      const dayObject = moment(`${year}/${month}/${a}`, "YYYY-MM-DD");
      const compareDate = moment(`${year}-${month}-${a}`, "YYYY-MM-DD");
      let flow: any = compareDate;
      let item = this._value!.filter(item => item.date == flow._i)
      return {
        name: dayObject.format("dddd"),
        value: a,
        date: flow._i,
        indexWeek: dayObject.isoWeekday(),
        availability: item[0]?.availability
      };
    }); this.monthSelect = arrayDays;
  }

  get value() { return this._value; }
  set value(v: DayState[] | undefined) {
    this._value = v || [];
    this.getDaysFromDate(this.fillZero(this.currentMonth), this.currentYear);
  }

  set(next: DayState[], notifyForm: boolean = true) {
    if ( next !== this.value ) {
      this.valueChange.emit(this.value = next);
      if ( notifyForm ) this.onChanged(this.value);
      this.cd.markForCheck();
    }
    //apparently skipping this call breaks everything
    super.set(next, notifyForm);
  }

  changeMonth(flag: any) {
    const nextDate = flag < 0 ? this.dateSelect.clone().subtract(1, "month") : this.dateSelect.clone().add(1, "month");
    this.currentMonth = nextDate.get('M') + 1; this.currentYear = nextDate.get('Y');
    this.getDaysFromDate(this.fillZero(this.currentMonth), this.currentYear);
    this.rangeStart = null; //cancel selection
  }

  onDayClicked(index: number, day: string, e: Event) {
    //e shouldnt be passed, it should be the host responsibility
    //set click listener on the host and when the emitted event occurs
    //read the value and show what needs to be shown

    console.log(this.rangeStart)
    if ( this.rangeStart !== null) {
      const min = Math.min(this.rangeStart, index),
        max = Math.max(this.rangeStart, index);
      
      const selection: string[] = [];
      for ( let i = min; i <= max; i++ )
        selection.push(this.monthSelect[i].date);
      
      this.setSelection(selection);
      this.rangeStart = null;
    } else {
      //first click
      if ( this.mode == 'range' )
        this.rangeStart = index;
      else {
        this.setSelection([day]);
        this.dayClick.emit([e, this.selection]);
      }
    }
  }

  setSelection(days: string[]) {
    this.selection = days;

    if ( !this.useEvents )
      this.mode == 'single' ? this.toggleDayState(this.selection[0], 'selected') : this.addValues(this.selection, 'selected');
  }

  setCurrentDayState(state: Availability) {
    const remaining = this.value!.filter(item => item.date !== this.selection[0]);
    let next;
    if (state != 'nothing') {
      next = [...remaining, {
        date: this.selection[0],
        availability: state
      }];
    }
    else {
      next = remaining;
    }

    this.onChange(next);
    // this.getDaysFromDate(this.fillZero(this.currentMonth), this.currentYear);
    this.cd.markForCheck();
  }

  toggleDayState(day: string, targetState: Availability) {
    const [[current], remaining] = filterSplit(this.value!, (item) => item.date == day);
    let next;
    if (current) {
      next = remaining;
    } else {
      next = [...remaining, {
        date: day,
        availability: targetState
      }];
    }

    this.onChange(next);
    // this.getDaysFromDate(this.fillZero(this.currentMonth), this.currentYear);
    this.cd.markForCheck();
  };

  addValues(days: string[], targetState: Availability) {
    //delete the overlap, it should take the new value
    const currentDates = this.value!.map(day => day.date),
      remaining1 = currentDates.filter(knownDate => !days.includes(knownDate)),
      remaining2 = days.filter(day => !currentDates.includes(day));
    
    this.onChange([...remaining1, ...remaining2].map(date => ({date, availability: targetState})));
    // this.getDaysFromDate(this.fillZero(this.currentMonth), this.currentYear);
    this.cd.markForCheck();
  }

  //write value
  writeValue(value: DayState[] | string[]): void {
    if ( value.length ) {
      if ( typeof value[0] == 'string' ) {
        super.writeValue((value as string[]).map(date => ({date, availability: 'selected'})));
      } else super.writeValue(value as DayState[]);
    } else super.writeValue(value as DayState[]);
  }
}