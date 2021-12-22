import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'app-root',
    templateUrl: './calendar.ui.html',
    styleUrls: ['./calendar.ui.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
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
    dateValue: Availibility[] = [];
    current: any;
    openModal: boolean = false;

    hori = false
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
            const dayObject = moment(`${year}/${month}/${a}`);
            const compareDate = moment(`${year}-${month}-${a}`);
            let flow :any = compareDate
            let item = this.dateValue.filter(item => item.date == flow._i)
            return {
                name: dayObject.format("dddd"),
                value: a,
                date: flow._i,
                indexWeek: dayObject.isoWeekday(),
                availbility : item[0]?.availibility
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

    
    thisday: any;
    eventt: any;
    choseDay(day: any, e: Event) {
        this.eventt = e;
        this.current = day;
        const monthYear = this.dateSelect.format('YYYY-MM')
        const parse = `${monthYear}-${day.value}`
        const objectDate = moment(parse)
        let fullDate: any = objectDate;
        this.thisday = fullDate._i;
    }
    clickDay(text: string) {
        let availability = ['available', 'availablelimits', 'unavailable']
        this.dateValue = this.dateValue.filter(item => item.date != this.thisday)
        if (text != 'nothing') {
            this.dateValue  = [...this.dateValue,{
                date: this.thisday,
                availibility: text  
            }]
        }
        if (!this.eventt.target.classList.contains(`${text}`)) {
            availability = availability.filter(item => item != text)
            this.eventt.target.classList.add(`${text}`)
            if (availability.length) {
                for (let i = 0; i < availability.length; i++) {
                    this.eventt.target.classList.remove(`${availability[i]}`)
                }
            } else {
                for (let i = 0; i < availability.length; i++) {
                    this.eventt.target.classList.remove(`${availability[i]}`)
                }
            }

        }
    }
}

interface Availibility {
    date: any
    availibility: string
} 