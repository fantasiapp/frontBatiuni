import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";
import { User } from "src/models/user/user.model";

@Component({
  selector: 'profile-resume',
  templateUrl: './profile-resume.component.html',
  styleUrls: ['./profile-resume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileResume {

  @Input()
  user!: User;

  @Input()
  showMore: boolean = false;

  @Input()
  changeImage: boolean = false;

  @Output()
  ratingsClicked = new EventEmitter();

  @Output()
  profileChanged = new EventEmitter<boolean>();

  @Output()
  changeImageAction = new EventEmitter<boolean>();

  onStarClicked() {
    this.ratingsClicked.emit();
  }
  onChangeImage() {
    this.ratingsClicked.emit(true);
  }
};