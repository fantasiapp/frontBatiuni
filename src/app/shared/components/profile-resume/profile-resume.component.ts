import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";
import { Company } from "src/models/data/data.model";
import { User } from "src/models/user/user.model";

@Component({
  selector: 'profile-resume',
  templateUrl: './profile-resume.component.html',
  styleUrls: ['./profile-resume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileResume {

  @Input('user')
  set companyFromUser(user: User) {
    this.company = user.profile!.company;
    this.user = user;
  }

  @Input('profile')
  set profile({user, company}: {user: User, company: Company}) {
    this.user = user;
    this.company = company;
  };

  user?: User;

  @Input()
  company!: Company;

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
};