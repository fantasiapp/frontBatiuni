import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as moment from 'moment';
import { Availability, CalendarUI, DayState } from '../calendar/calendar.ui';
import { trigger, state, style, animate, transition } from '@angular/animations';

export type MissionDetailedDay = {
  date: string;
  start: string;
  end: string;
  title: string;
  text: string[];
};

export interface calendarItem {
  cardFromTop: number,
  cardHeight: number,
  cardTitle: string,
  cardContent: string[]
}

@Component({
  selector: 'horizontal-calendar',
  templateUrl: './horizontal.agenda.html',
  styleUrls: ['./horizontal.agenda.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ opacity: 0 }),
            animate('200ms ease-out', style({ opacity: 1 }))
            
          ]
        ),
        transition(
          ':leave', 
          [
            style({ opacity: 1 }),
            animate('200ms ease-in', style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class HorizantaleCalendar implements OnInit {
  @ViewChild(CalendarUI, { static: true })
  calendar!: CalendarUI;

  week = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche',
  ];

  onDayClicked([_, selection]: [MouseEvent, DayState[]]) {
    this.showAgenda(selection[0]);
  }

  @Input()
  hideForDesktop: boolean = true;

  monthSelect: any[] = [];
  dateSelect: any;
  current: any;
  openModal: boolean = false;
  spanShowToday: any;
  selectedDay: any;
  hori: boolean = false;
  hoursperday: any;
  greenCardFromTop: number = 0;
  greenCardHeight: number = 0;
  bilan?: MissionDetailedDay[] = [];
  // detailedDays: MissionDetailedDay[] = []

  currentCardCalendars: calendarItem[] = [];

  ngOnInit(): void {
    let now = new Date(Date.now());
    this.getDaysFromDate(now.getMonth() + 1, now.getFullYear());
    this.setSelectedDays();
    this.someFunction();
    this.spanShowToday = moment(now)
      .locale('fr')
      .format('dddd D - MMMM - YYYY');
    this.showAgenda(moment(now).format('YYYY-MM-DD'));
    this.showColors();
  }

  toCalendarDays(workDays: MissionDetailedDay[]): DayState[] {
    this.detailedDays = workDays;
    return workDays.map((workDay) => ({
      date: workDay.date,
      availability: 'selected',
    }));
  }

  setSelectedDays() {
    let currentDate = moment();
    let daysInMonth = currentDate.daysInMonth();
    let weekStart = currentDate.clone().startOf('isoWeek');
    let days = [];
    for (var i = 1; i <= daysInMonth; i++) {
      if (i == 1) {
        days.push({
          day: moment(weekStart)
            .locale('fr')
            .add(i, 'days')
            .format('D,dddd,YYYY-MM-DD')
            .split(','),
          status: '',
          selected: true,
        });
      } else {
        days.push({
          day: moment(weekStart)
            .locale('fr')
            .add(i, 'days')
            .format('D,dddd,YYYY-MM-DD')
            .split(','),
          status: '',
          selected: false,
        });
      }
    }
    this.selectedDay = days;
  }

  getDaysFromDate(month: any, year: any) {
    const startDate = moment.utc(`${year}/${month}/01`, 'YYYY-MM-DD');
    const endDate = startDate.clone().endOf('month');
    this.dateSelect = startDate;

    const diffDays = endDate.diff(startDate, 'days', true);
    const numberDays = Math.round(diffDays);
    const arrayDays = Object.keys([...Array(numberDays)]).map((a: any) => {
      a = parseInt(a) + 1;
      const dayObject = moment(`${year}/${month}/${a}`);
      let flow: any = dayObject;
      let item = this.detailedDays.filter((item) => item.date == flow._i);
      if (item.length) {
        return {
          name: dayObject.format('dddd'),
          value: a,
          indexWeek: dayObject.isoWeekday(),
          date: flow._i,
          availbility: 'occupe',
        };
      } else {
        return {
          name: dayObject.format('dddd'),
          value: a,
          indexWeek: dayObject.isoWeekday(),
          date: flow._i,
          availbility: 'not',
        };
      }
    });
    this.monthSelect = arrayDays;
  }

  changeMonth(flag: any) {
    if (flag < 0) {
      const prevDate = this.dateSelect.clone().subtract(1, 'month');
      this.getDaysFromDate(prevDate.format('MM'), prevDate.format('YYYY'));
    } else {
      const nextDate = this.dateSelect.clone().add(1, 'month');
      this.getDaysFromDate(nextDate.format('MM'), nextDate.format('YYYY'));
    }
  }

  changeVue() {
    this.hori = !this.hori;
  }

  someFunction() {
    const items: any = [];
    // From 08:00 tp 19:00
    for (let i = 6; i < 20; i++) {
      items.push(moment({ hour: i }).locale('fr').format('HH'));
    }
    this.hoursperday = items;
  }

  @Input()
  detailedDays: MissionDetailedDay[] = [];

  calculator(workstart: string, workend: string) {
    let start = this.hoursTodecimal(workstart);
    let end = this.hoursTodecimal(workend);

    console.log('start', start, workstart);
    this.greenCardFromTop = (start - 6) * 25 + 12.5;
    this.greenCardHeight = (end - start) * 25;

    return [(start - 6) * 25 + 12.5, (end - start) * 25]
  }
  hoursTodecimal(time: string) {
    let hoursMinutes = time.split(/[.:]/);
    let hours = parseInt(hoursMinutes[0], 10);
    let minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
    minutes = ~~(minutes / 30) * 30
    return hours + minutes / 60;
  }

  showAgenda(date: any) {
    this.spanShowToday = moment(date, 'YYYY-MM-DD')
      .locale('fr')
      .format('dddd D - MMMM - YYYY');
    let todayDates = this.detailedDays.filter((item) => item?.date == date);


    this.currentCardCalendars = []
    for (const today of todayDates) {
      let heightTop = this.calculator(today.start, today.end)
      this.currentCardCalendars.push({
        cardFromTop: heightTop[0],
        cardHeight: heightTop[1],
        cardTitle: today.title,
        cardContent: today.text
      })
    }
    // if (today.length) {
      // this.calculator(today[0].start, today[0].end);
    //   this.bilan = today[0];
    // } else {
    //   this.greenCardFromTop = 0;
    //   this.greenCardHeight = 0;
    // }
    
  }

  showgrey(selectedday: any) {
    this.selectedDay.forEach((item: any) => (item.selected = false));
    selectedday.selected = true;
    return [...this.selectedDay, selectedday];
  }

  showColors() {
    this.selectedDay.forEach((item: any) => {
      let compare = this.detailedDays;
      compare = compare.filter((element) => element.date == item.day[2]);
      if (compare.length) {
        item.status = 'occupe';
      } else {
        item.status = '';
      }
    });
  }
}
