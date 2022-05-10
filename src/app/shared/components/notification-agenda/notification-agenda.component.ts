import { ChangeDetectorRef, Component, Input, Output, EventEmitter } from '@angular/core';
import { calendarItem } from '../horizontalcalendar/horizontal.component';
import { ModifyDetailedPost, ValidateMissionDate } from "src/models/new/user/user.actions";
import { Store } from '@ngxs/store';
import { DataQueries } from 'src/models/new/data.state';


@Component({
  selector: 'notification-agenda',
  templateUrl: './notification-agenda.component.html',
  styleUrls: ['./notification-agenda.component.scss']
})
export class NotificationAgendaComponent {

  @Input() card!: calendarItem;
  @Input() field!: string;
  @Input() date!: string;

  @Output() cardUpdate: EventEmitter<boolean> = new EventEmitter()


  constructor(private cd: ChangeDetectorRef, private store: Store) { }

  ngOnInit(): void {
    console.log('card', this.card);
  }

  validate(){
    this.store.dispatch(new ValidateMissionDate(this.card.mission.id, this.field, true, '')).pipe().subscribe(()=>{
      console.log('object');
      this.cardUpdate.emit()
    })

  }
  
  refuse(){

    this.store.dispatch(new ValidateMissionDate(this.card.mission.id, this.field, false, '')).pipe().subscribe(()=>{
      this.cardUpdate.emit()
    })
  }


  deleted(b: boolean){
    this.field = 'date'
    
    this.store.dispatch(new ValidateMissionDate(this.card.mission.id, this.field, b, this.date)).pipe().subscribe(()=>{
      this.cardUpdate.emit(b)
    })
    
  }
}
