import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'app-root',
    templateUrl: './calendar.ui.html',
    styleUrls: ['./calendar.ui.scss']
})
export class CalendarUI implements OnInit {

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
    dateValue: string[] = [];
    current: any;
    manager: any;
    constructor() {

    }

    ngOnInit(): void {
        let now = new Date(Date.now())
        this.getDaysFromDate(now.getMonth() + 1, now.getFullYear())
    }

    getDaysFromDate(month: any, year: any) {

        const startDate = moment.utc(`${year}/${month}/01`)
        const endDate = startDate.clone().endOf('month')
        this.dateSelect = startDate;

        const diffDays = endDate.diff(startDate, 'days', true)
        const numberDays = Math.round(diffDays);

        const arrayDays = Object.keys([...Array(numberDays)]).map((a: any) => {
            a = parseInt(a) + 1;
            const dayObject = moment(`${year}-${month}-${a}`);
            return {
                name: dayObject.format("dddd"),
                value: a,
                indexWeek: dayObject.isoWeekday()
            };
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

    clickDay(day: any, e: Event) {
        this.current = day;
        const monthYear = this.dateSelect.format('YYYY-MM')
        const parse = `${monthYear}-${day.value}`
        const objectDate = moment(parse)
        let fullDate: any = objectDate;
        let toggle = this.dateValue.filter(element => element == fullDate._i);


        if ((e.currentTarget as any).classList.contains("lasttime")) {
            (e.currentTarget as any).classList.remove("lasttime");
            this.dateValue = this.dateValue.filter(element => element != fullDate._i);
        }

        let element = e.target as HTMLElement;


        if (!toggle.length) {
            (e.currentTarget as any).classList.add("active");
            this.dateValue.push(fullDate._i)
        }
        else if ((e.currentTarget as any).classList.contains("active")) {
            {
                (e.currentTarget as any).classList.remove("active");

                (e.currentTarget as any).classList.add("secondtime");
            }
        }
        else if ((e.currentTarget as any).classList.contains("secondtime")) {
            {
                (e.currentTarget as any).classList.remove("secondtime");

                (e.currentTarget as any).classList.add("lasttime");
            }
        }
        console.log(this.dateValue)
        //console.log(this.dateValue)
    }

}