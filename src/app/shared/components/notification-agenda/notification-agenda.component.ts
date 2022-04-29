import { ChangeDetectorRef, Component, Input, Output, EventEmitter } from '@angular/core';
import { calendarItem } from '../horizontalcalendar/horizontal.component';
import { ValidateMissionDate } from "src/models/new/user/user.actions";
import { Store } from '@ngxs/store';


@Component({
  selector: 'notification-agenda',
  templateUrl: './notification-agenda.component.html',
  styleUrls: ['./notification-agenda.component.scss']
})
export class NotificationAgendaComponent {

  @Input() card!: calendarItem;
  @Input() field!: string;
  @Input() date!: string;

  @Output() cardUpdate = new EventEmitter()


  constructor(private cd: ChangeDetectorRef, private store: Store) { }

  ngOnInit(): void {
  }

  validate(){
    this.store.dispatch(new ValidateMissionDate(this.card.mission.id, this.field, true, '')).pipe().subscribe(()=>{
      this.cardUpdate.emit()
    })

  }
  
  refuse(){
    this.store.dispatch(new ValidateMissionDate(this.card.mission.id, this.field, false, '')).pipe().subscribe(()=>{
      this.cardUpdate.emit()
    })
  }

}
