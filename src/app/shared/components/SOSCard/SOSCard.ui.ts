import { ChangeDetectionStrategy, Component, HostBinding, Input } from "@angular/core";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { UIProfileImageComponent } from "src/app/shared/components/profile-image/profile-image.component";
import { Company, Job, Profile } from "src/models/new/data.interfaces";
import { DataQueries, QueryProfile } from "src/models/new/data.state";
import { Availability } from "../calendar/calendar.ui";
import { ExtendedProfileComponent } from "../extended-profile/extended-profile.component";
import { SlidemenuService } from "../slidemenu/slidemenu.component";

@Component({
  selector: 'sos-card',
  template: `
    <div *ngIf="(profile$ | cast | async) as profile" class="container flex row center-cross space-around">
      <div class="presentation">
        <profile-image [profile]="profile"></profile-image>
        <stars [value]="profile.company.starsST" disabled></stars>
      </div>
      <div class="description grow flex column space-between">
        <span>{{profile.company.name}}</span>
        <span style="font-weight: 200;">{{profile.company.address}}</span>
        <span class="text-light-emphasis job">
          <ng-container *ngFor="let job of jobs">{{job.name}}, </ng-container>
        </span>
      </div>
    </div>
  `,
  styleUrls: ['./SOSCard.ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UISOSCard {

  @QueryProfile()
  @Input('profile')
  profile$!: number | Profile | Observable<Profile>;
  jobs: Job[] = [];

  @Input()
  availability: Availability = 'unavailable';

  constructor(private store: Store) {}

  ngOnInit() {
    (this.profile$ as Observable<Profile>).subscribe(profile => {
      if ( !profile ) return;
      const jobsForCompany = this.store.selectSnapshot(DataQueries.getMany('JobForCompany', profile.company.jobs));
      this.jobs = this.store.selectSnapshot(DataQueries.getMany('Job', jobsForCompany.map(({job}) => job)))
    });
  }

  //add a way to display a selected job

  @HostBinding('style.border-left-color')
  get borderColor() {
    if ( this.availability == 'available' )
      return "#B9EDAF";
    else if ( this.availability == 'availablelimits' )
      return "#ffc425";
    else if ( this.availability == 'unavailable' )
      return "red";
    
    return "#ccc";
  }
};