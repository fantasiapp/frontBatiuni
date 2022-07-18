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
  selector: 'sos-card-map',
  template: `
    <div *ngIf="(profile$ | cast | async) as profile" class="container flex row center-cross space-around">
    <div class="description grow flex column">
        <span class='name'>{{profile.company.name}}</span>
        <span class="address">{{profile.company.address}}</span>
        <span class="job">
          <ng-container *ngFor="let job of jobs">{{job.name}}, </ng-container>
        </span>
        <!-- <span class="disponibility">{{availability}}</span> -->
    </div>
    <div class="presentation">
        <profile-image [profile]="profile"></profile-image>
    </div>
    </div>
  `,
  styleUrls: ['./SOSCardMap.ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UISOSCardMap {

  @QueryProfile()
  @Input('profile')
  profile$!: number | Profile | Observable<Profile>;

  @Input()
  jobs: Job[] = [];

  @Input()
  availability: Availability = 'unavailable';

  starsST: string = ''

  constructor(private store: Store) {}

  ngOnInit() {
    (this.profile$ as Observable<Profile>).subscribe(profile => {
      if ( !profile ) return;
      const jobsForCompany = this.store.selectSnapshot(DataQueries.getMany('JobForCompany', profile.company.jobs));
      this.jobs = this.store.selectSnapshot(DataQueries.getMany('Job', jobsForCompany.map(({job}) => job)))
      this.starsST = profile.company.starsST
    });
  }

  //add a way to display a selected job

  @HostBinding('style.border-left-color')
  get borderColor() {
    if ( this.availability == 'available' )
      return "#B9EDAF";
    else if ( this.availability == 'availablelimits' )
      return "#FFC425";
    else if ( this.availability == 'unavailable' )
      return "red";
    
    return "#ccc";
  }
};