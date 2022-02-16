import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { Profile } from "src/models/new/data.interfaces";
import { DataState } from "src/models/new/data.state";
import { ChangeProfileType } from "src/models/new/user/user.actions";

@Component({
  selector: 'profile-resume',
  templateUrl: './profile-resume.component.html',
  styleUrls: ['./profile-resume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileResume {

  constructor(private store: Store) {}

  @Input()
  profile!: Profile;  

  @Select(DataState.view)
  view$!: Observable<string>;

  @Input()
  switch: boolean = true;

  @Input()
  showMore: boolean = false;

  @Input()
  star: boolean = true;

  @Input()
  canChangePicture: boolean = false;

  @Output()
  ratingsClicked = new EventEmitter();

  @Output()
  changePicture = new EventEmitter();

  changeProfileType(type: boolean) {
    this.store.dispatch(new ChangeProfileType(type));
  }
};