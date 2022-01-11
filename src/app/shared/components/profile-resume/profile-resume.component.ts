import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";
import { User } from "src/models/user/user.model";

@Component({
  selector: 'profile-resume',
  templateUrl: './profile-resume.component.html',
  styleUrls: ['./profile-resume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileResume {
  @HostBinding('class')
  get classes() { return 'flex column center-cross space-children-margin'; }

  @Input()
  user!: User;

  @Input()
  showMore: boolean = false;

  @Output()
  ratingsClicked = new EventEmitter();

  @Output()
  profileChanged = new EventEmitter<boolean>();
};