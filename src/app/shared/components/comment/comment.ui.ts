import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Profile, Supervision } from "src/models/new/data.interfaces";
import { QueryProfile } from "src/models/new/data.state";

@Component({
  selector: 'comment',
  template: `
    <ng-container *ngIf="(profile$ | cast | async) as profile">
      <div class="main flex">
        <div class="image-container">
          <profile-image [profile]="profile" [borders]="false"></profile-image>
        </div>
        <div class="content grow">
          <div class="body">
            <h5 class="author">{{profile.user!.firstName}} {{profile.user!.lastName}}</h5>
            <div class="comment">{{ supervision.comment }}</div>
          </div>
          <div class="replies flex center-cross position-relative" style="left: 30px">
            <!-- Get most recent-->
            <div class="reply-container">
              <profile-image [profile]="profile" [borders]="false"></profile-image>
            </div>
            <span class="replies-number">Il y a 5 réponses</span>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: ['./comment.ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIComment {
  
  @Input()
  edit: boolean = true;

  @Input()
  supervision: Supervision = {
    id: -1,
    author: "Gabriel Dubois",
    companyId: 1,
<<<<<<< HEAD
||||||| d5bad5d9
    Supervisions: [],
=======
    // Supervisions: [],
>>>>>>> eeafa3d7865b04758f72baedcfdf1d288dc1bbbc
    comment: "Lorem ipsum dolor sit amet",
    date: '11-11-2022',
    files: []
  };

  @QueryProfile()
  @Input('profile')
  profile$!: number | Profile | Observable<Profile>;


};