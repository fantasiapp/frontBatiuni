import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import * as moment from "moment";
import { Availability, CalendarUI, DayState } from "../calendar/calendar.ui";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import {
  Disponibility,
  Mission,
  PostDetail,
  Profile,
  Ref,
} from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";
import { ModifyDetailedPost } from "src/models/new/user/user.actions";
import { take } from "rxjs/operators";
import { Store } from "@ngxs/store";

export type MissionDetailedDay = {
  date: string;
  mission: Mission;
  title: string;
  tasks: PostDetail[];
};

export interface calendarItem {
  cardFromTop: number;
  cardHeight: number;
  mission: Mission;
  title: string;
  tasks: PostDetail[];
  date: string;
  change: {
    schedule: boolean;
    deleted: boolean;
  };
}

@Component({
  selector: "horizontal-calendar",
  templateUrl: "./horizontal.agenda.html",
  styleUrls: ["./horizontal.agenda.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("inOutAnimation", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("200ms ease-out", style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class HorizontaleCalendar implements OnInit {
  static NUMBER_OF_DAYS_DISPLAYED: number = 50;
  @ViewChild(CalendarUI, { static: true })
  calendar!: CalendarUI;

  week = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
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
  disponibilities!: Disponibility[];
  curDisponibility?: Disponibility;

  currentCardCalendars: calendarItem[] = [];

  @Input()
  detailedDays: MissionDetailedDay[] = [];

  constructor(private cd: ChangeDetectorRef, private store: Store) {}

  ngOnInit(): void {
    const profile = this.store.selectSnapshot(DataQueries.currentProfile);
    this.disponibilities = this.store.selectSnapshot(
      DataQueries.getMany("Disponibility", profile.company.availabilities)
    );

    let now = new Date(Date.now());
    this.getDaysFromDate(now.getMonth() + 1, now.getFullYear());
    this.setSelectedDays();
    this.someFunction();
    // console.log(moment(now));
    this.spanShowToday = moment(now)
      .locale("fr")
      .format("dddd D - MMMM - YYYY");

    this.showAgenda(moment(now).format("YYYY-MM-DD"));
    this.showColors();
  }

  toCalendarDays(workDays: MissionDetailedDay[]): DayState[] {
    console.log("toCalendar days", this.detailedDays);
    this.detailedDays = workDays;

    return workDays.map((workDay) => ({
      date: workDay.date,
      availability: "selected",
    }));
  }

  setSelectedDays() {
    const currentDate = moment(),
      currentDateFormated = currentDate
        .locale("fr")
        .format("D,dddd,YYYY-MM-DD")
        .split(","),
      weekStart = currentDate.clone().startOf("isoWeek");
    let days = [];
    for (let i = 0; i < HorizontaleCalendar.NUMBER_OF_DAYS_DISPLAYED; i++) {
      const dayFormated = moment(weekStart)
        .locale("fr")
        .add(i, "days")
        .format("D,dddd,YYYY-MM-DD")
        .split(",");
      const selected = dayFormated[2] == currentDateFormated[2];
      days.push({
        day: dayFormated,
        status: "",
        selected: selected,
      });
    }
    this.selectedDay = days;
  }

  getDaysFromDate(month: any, year: any) {
    const startDate = moment.utc(`${year}/${month}/01`, "YYYY-MM-DD");
    const endDate = startDate.clone().endOf("month");
    this.dateSelect = startDate;

    const diffDays = endDate.diff(startDate, "days", true);
    const numberDays = Math.round(diffDays);
    const arrayDays = Object.keys([...Array(numberDays)]).map((a: any) => {
      a = parseInt(a) + 1;
      const dayObject = moment(`${year}/${month}/${a}`);
      let flow: any = dayObject;
      let item = this.detailedDays.filter((item) => item.date == flow._i);
      if (item.length) {
        return {
          name: dayObject.format("dddd"),
          value: a,
          indexWeek: dayObject.isoWeekday(),
          date: flow._i,
          availbility: "occupe",
        };
      } else {
        return {
          name: dayObject.format("dddd"),
          value: a,
          indexWeek: dayObject.isoWeekday(),
          date: flow._i,
          availbility: "not",
        };
      }
    });
    this.monthSelect = arrayDays;
  }

  changeMonth(flag: any) {
    if (flag < 0) {
      const prevDate = this.dateSelect.clone().subtract(1, "month");
      this.getDaysFromDate(prevDate.format("MM"), prevDate.format("YYYY"));
    } else {
      const nextDate = this.dateSelect.clone().add(1, "month");
      this.getDaysFromDate(nextDate.format("MM"), nextDate.format("YYYY"));
    }
  }

  changeVue() {
    this.hori = !this.hori;
  }

  someFunction() {
    const items: any = [];
    // From 08:00 tp 19:00
    for (let i = 6; i < 20; i++) {
      items.push(moment({ hour: i }).locale("fr").format("HH"));
    }
    this.hoursperday = items;
  }

  calculator(workstart: string, workend: string) {
    let start = this.hoursTodecimal(workstart);
    let end = this.hoursTodecimal(workend);

    this.greenCardFromTop = (start - 6) * 25 + 12.5;
    this.greenCardHeight = (end - start) * 25;

    return [(start - 6) * 25 + 12.5, (end - start) * 25];
  }
  hoursTodecimal(time: string) {
    let hoursMinutes = time.split(/[.:]/);
    let hours = parseInt(hoursMinutes[0], 10);
    let minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;

    //arrondie a 30min
    minutes = ~~(minutes / 30) * 30;
    return hours + minutes / 60;
  }

  showAgenda(date: any) {
    this.spanShowToday = moment(date, "YYYY-MM-DD")
      .locale("fr")
      .format("dddd D - MMMM - YYYY");

    let todayDates = this.detailedDays.filter((item) => item?.date == date);

    this.curDisponibility = undefined;
    for (const dip of this.disponibilities) {
      if (dip.date == date) this.curDisponibility = dip;
    }

    this.currentCardCalendars = [];
    this.cd.markForCheck();

    for (const today of todayDates) {
      let heightTop = this.calculator(
        today.mission.hourlyStart,
        today.mission.hourlyEnd
      );
      this.currentCardCalendars.push({
        cardFromTop: heightTop[0],
        cardHeight: heightTop[1],
        title: today.title,
        tasks: today.tasks,
        mission: today.mission,
        date: today.date,
        change: this.dateChange(today.mission, today.date),
      });
    }

    this.cd.markForCheck();
  }

  dateChange(
    mission: Mission,
    date: string
  ): { schedule: boolean; deleted: boolean } {
    let isChange = {
      schedule: false,
      deleted: false,
    };

    let datesId;
    if (typeof mission.dates === "object" && !Array.isArray(mission.dates))
      datesId = Object.keys(mission.dates).map((key) => +key as number);
    else datesId = mission.dates;

    let dates = this.store.selectSnapshot(
      DataQueries.getMany("DatePost", datesId)
    );
    for (const datePost of dates) {
      if (datePost.date == date) isChange.deleted = datePost.deleted;
    }
    if (!isChange.deleted)
      isChange.schedule =
        !!mission.hourlyEndChange || !!mission.hourlyStartChange;
    return isChange;
  }

  onCardUpdate(dayDestroy: boolean | null, card: calendarItem) {
    let mission = this.store.selectSnapshot(
      DataQueries.getById("Mission", card.mission.id)
    );
    let heightTop = this.calculator(mission!.hourlyStart, mission!.hourlyEnd);

    card.mission = mission!;
    card.cardFromTop = heightTop[0];
    card.cardHeight = heightTop[1];
    card.change = this.dateChange(mission!, card.date);

    if (dayDestroy) {
      let newCardCalendars: calendarItem[] = [];
      for (let curCard of this.currentCardCalendars) {
        if (curCard.mission.id != card.mission.id || curCard.date != card.date)
          newCardCalendars.push(curCard);
      }
      this.currentCardCalendars = newCardCalendars;
    } else if (dayDestroy == false) {
      card.change.deleted = false;
    }

    this.cd.markForCheck();
  }

  fieldValidation(card: calendarItem) {
    console.log(card.mission.hourlyStartChange);
    if (card.mission.hourlyStartChange) {
      console.log(card.mission.hourlyStartChange);
      return "hourlyStart";
    }
    if (card.mission.hourlyEndChange) return "hourlyEnd";
    return "";
  }

  taskValidation(decision: boolean, task: any) {
    const detailPost: PostDetail | null = this.store.selectSnapshot(
      DataQueries.getById("DetailedPost", task.idTask)
    );

    if (!detailPost!.refused) {
      detailPost!.validated = decision;
      task.validated = decision;
      this.store
        .dispatch(new ModifyDetailedPost(detailPost))
        .pipe(take(1))
        .subscribe(() => {
          this.cd.markForCheck();
        });
    }
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
        item.status = "occupe";
      } else {
        item.status = "";
      }
    });
  }
}
