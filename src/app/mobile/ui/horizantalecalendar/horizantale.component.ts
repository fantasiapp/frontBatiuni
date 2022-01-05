import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'horizantale-calendar',
    templateUrl: './horizantal.agenda.html',
    styleUrls: ['./horizantal.agenda.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HorizantaleCalendar implements OnInit {

    week = [
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
    current: any;
    openModal: boolean = false;
    spanShowToday : any;
    weekend: any;
    hori: boolean = false;
    hoursperday: any;
    greenCardFromTop: number = 0;
    greenCardHeight : number = 0;
    bilan : string = '' 

    ngOnInit(): void {
        let now = new Date(Date.now())
        this.getDaysFromDate(now.getMonth() + 1, now.getFullYear())
        this.getWeek();
        this.someFunction()
        this.spanShowToday = moment(now).locale('fr').format("dddd D - MMMM - YYYY")
        this.showAgenda(moment(now).format("YYYY/MM/DD"))
        this.showColors()
    }
    getWeek() {
        let currentDate = moment();

        let weekStart = currentDate.clone().startOf('isoWeek');

        let days = [];
        for (var i = 1; i <= 14; i++) {
            if(i==1) {
                console.log(weekStart)
                days.push({
                    day : moment(weekStart).locale("fr").add(i, 'days').format("D,dddd,YYYY/MM/DD").split(','),
                    status : '',
                    selected : true
                })
            }
            else{
                days.push({
                    day : moment(weekStart).locale("fr").add(i, 'days').format("D,dddd,YYYY/MM/DD").split(','),
                    status : '',
                    selected : false
                })
            }
        }
        this.weekend = days

    }
    
    getDaysFromDate(month: any, year: any) {

        const startDate = moment.utc(`${year}/${month}/01`, "YYYY-MM-DD")
        const endDate = startDate.clone().endOf('month')
        this.dateSelect = startDate;

        const diffDays = endDate.diff(startDate, 'days', true)
        const numberDays = Math.round(diffDays);
        const arrayDays = Object.keys([...Array(numberDays)]).map((a: any) => {
            a = parseInt(a) + 1;
            const dayObject = moment(`${year}/${month}/${a}`);
            let flow :any = dayObject
            let item = this.working.filter(item => item.date == flow._i)
            if(item.length){
                return {
                    name: dayObject.format("dddd"),
                    value: a,
                    indexWeek: dayObject.isoWeekday(),
                    date : flow._i,
                    availbility : 'occupe'
                };
            }else {
                return {
                    name: dayObject.format("dddd"),
                    value: a,
                    indexWeek: dayObject.isoWeekday(),
                    date : flow._i,
                    availbility : 'not'
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
        for (let i = 8; i < 20; i++) {
            items.push(moment({ hour: i }).locale('fr').format('HH'));
        }
        this.hoursperday = items
    }

    working = [
        {
            date : "2021/12/21",
            start : "8:30",
            end : "16:00",
            text : "Some text with the company name and adress"
        },
        {
            date : "2021/12/22",
            start : "8:00",
            end : "14:00",
            text : "Some text with the company name and adress"
        },
        {
            date : "2021/12/23",
            start : "8:30",
            end : "19:00",
            text : "Some text with the az name and adress"
        },
        {
            date : "2021/12/26",
            start : "8:30",
            end : "11:00",
            text : "Some text with the company name and adress"
        },
        {
            date : "2022/01/26",
            start : "8:30",
            end : "11:00",
            text : "Some text with the company name and adress"
        },
    ]

    calculator(workstart:string, workend:string) {
        let start = this.hoursTodecimal(workstart)
        let end = this.hoursTodecimal(workend)
        
        this.greenCardFromTop  = (start - 8) * 25 + 12.5;
        this.greenCardHeight = (end - start) * 25;
    }
    hoursTodecimal(time:string) {
        let hoursMinutes = time.split(/[.:]/);
        let hours = parseInt(hoursMinutes[0], 10);
        let minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
        return hours + minutes/60
    }

    showAgenda(date:any) {
        this.spanShowToday = moment(date,"YYYY/MM/DD").locale('fr').format("dddd D - MMMM - YYYY")
        let today = this.working.filter(item => item?.date == date)
        if(today.length)
        {
            this.calculator(today[0].start, today[0].end)
            this.bilan = today[0].text
        }else {
            this.greenCardFromTop = 0
            this.greenCardHeight = 0
        }   
    }
    showgrey(selectedday:any) {
        this.weekend.forEach((item:any) => item.selected=false)
        selectedday.selected = true
        return [...this.weekend, selectedday ]
    }
    showColors() {
        this.weekend.forEach((item:any) => {
            let compare = this.working;
            compare = compare.filter(element=>element.date == item.day[2])
            if(compare.length){
                item.status = "occupe"
            }else {
                item.status = ""
            }
            
        })
        
    }

}
