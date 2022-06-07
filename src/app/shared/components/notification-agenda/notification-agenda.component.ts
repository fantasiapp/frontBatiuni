import {
  ChangeDetectorRef,
  Component,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { calendarItem } from "../horizontalcalendar/horizontal.component";
import {
  ModifyDetailedPost,
  ValidateMissionDate,
} from "src/models/new/user/user.actions";
import { Store } from "@ngxs/store";
import { DataQueries } from "src/models/new/data.state";

@Component({
  selector: "notification-agenda",
  templateUrl: "./notification-agenda.component.html",
  styleUrls: ["./notification-agenda.component.scss"],
})
export class NotificationAgendaComponent {
  @Input() card!: calendarItem;
  // @Input() field!: string;
  @Input() date!: string;

  @Output() cardUpdate: EventEmitter<any> = new EventEmitter();

  constructor(private cd: ChangeDetectorRef, private store: Store) {}

  ngOnInit(): void {
  }

  validateHour(b: boolean, e: Event) {
    console.log('validate HOUR ');
    let field = 'hourly'
    this.store.dispatch(new ValidateMissionDate(this.card.mission.id, field, b, "")).pipe().subscribe(() => {
      this.card.change.schedule = !b
      this.cardUpdate.emit(this.card.change);
     });
  }


  deleted(b: boolean, deleting: boolean) {
    let field = "date";

    console.log('validateMissionDate', this.card.mission.id, field, b, this.date);
    this.store.dispatch(new ValidateMissionDate(this.card.mission.id, field, b, this.date)).pipe().subscribe(() => {
      console.log('validateMission 1 card change', this.card);
      this.card.change = { 
        validate: deleting ? !b : b,
        deleted: deleting && b,
        schedule: this.card.change.schedule
      }
      console.log('validateMission 2 card change', this.card);
      this.cardUpdate.emit(this.card.change);
    });
  }
}
