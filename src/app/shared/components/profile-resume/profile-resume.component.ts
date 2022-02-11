import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { Select } from "@ngxs/store";
import { Observable } from "rxjs";
import { Profile } from "src/models/new/data.interfaces";
import { DataState } from "src/models/new/data.state";

@Component({
  selector: 'profile-resume',
  templateUrl: './profile-resume.component.html',
  styleUrls: ['./profile-resume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileResume {

  @Select(DataState.view)
  view$!: Observable<string>;

  @Input('profile')
  profile!: Profile;

  @Input()
  switch: boolean = true;

  @Input()
  showMore: boolean = false;

  @Input()
  star: boolean = true;

  @Input()
  changeImage: boolean = false;

  @Input()
  canChangePicture: boolean = false;

  @Output()
  ratingsClicked = new EventEmitter();

  @Output()
  profileChanged = new EventEmitter<boolean>();

  @Output()
  changePicture = new EventEmitter();

  ngOnInit() {
    console.log('#', this.profile);
  }
};