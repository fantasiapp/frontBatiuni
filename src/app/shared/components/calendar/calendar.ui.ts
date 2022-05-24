import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { UIDefaultAccessor } from "../../common/classes";
import * as moment from "moment";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { filterSplit } from "../../common/functions";
import { DataQueries } from "src/models/new/data.state";
import { Mission } from "src/models/new/data.interfaces";
import { Observable, Subscription } from "rxjs";

export type Availability =
  | "available"
  | "availablelimits"
  | "unavailable"
  | "selected"
  | "nothing"
  | "notification";
export interface DayState {
  date: string;
  availability: Availability;
}

export type CalendarMode = "range" | "single";

@Component({
  selector: "calendar",
  templateUrl: "./calendar.ui.html",
  styleUrls: ["./calendar.ui.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: CalendarUI,
    },
  ],
})
export class CalendarUI extends UIDefaultAccessor<DayState[]> {
  //à renommer ou à mettre à jour automatique une fois qu'on est une partie d'un form
  @Input()
  useEvents: boolean = true;

  @Input()
  mode: CalendarMode = "single";

  @Input()
  disableBeforeToday: boolean = false;

  rangeMomentStart: moment.Moment | null = null;

  @Output()
  dayClick = new EventEmitter();

  week: any = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];

  monthSelect: {
    name: string;
    value: any;
    date: any;
    indexWeek: number;
    availability: Availability;
    blockedDay: boolean
  }[] = [];

  dateSelect: any;
  selection: string[] = [];
  currentMonth: number = 0;
  currentYear: number = 0;
  store: any;
  
  @Input()
  mission: Mission | null= null;

  @Input()
  blockedDate: string[] = []

  constructor(cd: ChangeDetectorRef) {
    super(cd);
    // this.blockedDays = this.computeBlockedDate()
    
    
  }
  
  ngOnInit(){
    let now = new Date(Date.now());
    
    this.currentMonth = now.getMonth() + 1;
    this.currentYear = now.getFullYear();
    this.value = [];
    this.blockThePast(now)
    this.viewCurrentDate()
  }

  blockThePast(now: any){
    if(this.disableBeforeToday){
      //  console.log('today', now, moment(now));
      console.log('today', moment(now).format('YYYY-MM-DD'));
      const today = moment(now).format('YYYY-MM-DD')
      let day = Number(today.substring(8,10))
      let month = Number(today.substring(5,7))
      let year = Number(today.substring(0, 4))
      console.log('currentMonth', this.currentMonth);
      // console.log('DJAFA', day, month, year);

      if (this.currentYear > year) return
      else if (this.currentYear == year && this.currentMonth > month) return
      else if (this.currentYear == year && this.currentMonth == month) {}
      else day = 32

      for (let i = 1; i < day; i++) {
        this.blockedDate.push(this.fillZero(this.currentYear) + '-' + this.fillZero(this.currentMonth) + '-' + this.fillZero(i))
      }

    }
  }


  private fillZero(month: number) {
    if (month < 10) return "0" + month;
    return month;
  }

  viewCurrentDate() {
    let now = new Date(Date.now());
    this.currentMonth = now.getMonth() + 1;
    this.currentYear = now.getFullYear();
    this.getDaysFromDate(this.fillZero(this.currentMonth), this.currentYear);
  }

  getDaysFromDate(month: any, year: any) {
    const startDate = moment.utc(`${year}/${month}/01`, "YYYY-MM-DD");
    const endDate = startDate.clone().endOf("month");
    this.dateSelect = startDate.locale("fr");
    const diffDays = endDate.diff(startDate, "days", true);
    const numberDays = Math.round(diffDays);
    const arrayDays = Object.keys([...Array(numberDays)]).map((a: any, i) => {
      a = this.fillZero(parseInt(a) + 1);
      const dayObject = moment(`${year}/${month}/${a}`, "YYYY-MM-DD");
      const compareDate = moment(`${year}-${month}-${a}`, "YYYY-MM-DD");
      let flow: any = compareDate;
      let item = this._value!.filter((item) => item.date == flow._i);
      return {
        name: dayObject.format("dddd"),
        value: a,
        date: flow._i,
        indexWeek: dayObject.isoWeekday(),
        availability: item[0]?.availability,
        blockedDay: !!this.blockedDate.filter(date => date == flow._i)?.length
      };
    });
    this.monthSelect = arrayDays;
  }

  get value() {
    return this._value;
  }
  set value(v: DayState[] | undefined) {
    this._value = v || [];
    this.getDaysFromDate(this.fillZero(this.currentMonth), this.currentYear);
  }

  set(next: DayState[], notifyForm: boolean = true) {
    if (next !== this.value) {
      this.valueChange.emit((this.value = next));
      if (notifyForm) this.onChanged(this.value);
      this.cd.markForCheck();
    }
    //apparently skipping this call breaks everything
    super.set(next, notifyForm);
  }

  changeMonth(flag: any) {
    const nextDate =
      flag < 0 ? this.dateSelect.clone().subtract(1, "month") : this.dateSelect.clone().add(1, "month");
    this.currentMonth = nextDate.get("M") + 1;
    this.currentYear = nextDate.get("Y");
    this.blockThePast(new Date(Date.now()))
    this.getDaysFromDate(this.fillZero(this.currentMonth), this.currentYear);
  }

  onDayClicked(day: string, e: Event) {
    const dayMoment = moment(day);
    if (this.rangeMomentStart !== null) {
      const min = moment.min(dayMoment, this.rangeMomentStart),
        max = moment.max(dayMoment, this.rangeMomentStart);
      let selection: string[] = [];
      for (let i = 0; i <= max.diff(min, "days"); i++)
        selection.push(
          moment(min).locale("fr").add(i, "days").format("YYYY-MM-DD")
        );
      this.setSelection(selection);
      this.rangeMomentStart = null;
    } else {
      if (this.mode == "range") {
        this.rangeMomentStart = dayMoment;
      } else {
        this.setSelection([day]);
        this.dayClick.emit([e, this.selection]);
      }
    }
  }

  setSelection(days: string[]) {
    this.selection = days;

    if (!this.useEvents)
      this.mode == "single"
        ? this.toggleDayState(this.selection[0], "selected")
        : this.addValues(this.selection, "selected");
  }

  setCurrentDayState(state: Availability) {
    const remaining = this.value!.filter(
      (item) => item.date !== this.selection[0]
    );
    let next;
    if (state != "nothing") {
      next = [
        ...remaining,
        {
          date: this.selection[0],
          availability: state,
        },
      ];
    } else {
      next = remaining;
    }

    this.onChange(next);
    // this.getDaysFromDate(this.fillZero(this.currentMonth), this.currentYear);
    this.cd.markForCheck();
  }

  toggleDayState(day: string, targetState: Availability) {
    const [[current], remaining] = filterSplit(
      this.value!,
      (item) => item.date == day
    );
    let next;
    if (current) {
      next = remaining;
    } else {
      next = [
        ...remaining,
        {
          date: day,
          availability: targetState,
        },
      ];
    }

    this.onChange(next);
    // this.getDaysFromDate(this.fillZero(this.currentMonth), this.currentYear);
    this.cd.markForCheck();
  }

  addValues(days: string[], targetState: Availability) {
    //delete the overlap, it should take the new value
    const currentDates = this.value!.map((day) => day.date),
      remaining1 = currentDates.filter(
        (knownDate) => !days.includes(knownDate)
      ),
      remaining2 = days.filter((day) => !currentDates.includes(day));

    this.onChange(
      [...remaining1, ...remaining2].map((date) => ({
        date,
        availability: targetState,
      }))
    );
    // this.getDaysFromDate(this.fillZero(this.currentMonth), this.currentYear);
    this.cd.markForCheck();
  }

  //write value
  writeValue(value: DayState[] | string[]): void {
    if (value.length) {
      if (typeof value[0] == "string") {
        super.writeValue(
          (value as string[]).map((date) => ({
            date,
            availability: "selected",
          }))
        );
      } else super.writeValue(value as DayState[]);
    } else super.writeValue(value as DayState[]);
  }
}
