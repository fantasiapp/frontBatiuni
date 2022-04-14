import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { Candidate, Company, Job, Mission, Profile } from "src/models/new/data.interfaces";
import { DataQueries, QueryProfile, Snapshot } from "src/models/new/data.state";

//maybe merge with sos ?
@Component({
  selector: 'profile-card',
  template: `
    <ng-container *ngIf="(profile$ | cast | async) as profile">
      <!-- <app-banner [candidate]="candidate"]></app-banner> -->
      <profile-image [profile]="profile"></profile-image>
      <div class="flex column small-space-children-margin font-Poppins description">
        <span>{{ profile.company.name || "Nom de l'entreprise" }}</span>
        <span>Propose {{ employeeCount }} {{job.name || 'Employées'}}</span>
        <span>Note générale ({{ profile.company.starsST }}/5 par {{ profile.company.missions.length }} personnes)</span>
        <!-- <span>{{ candidate!.amount }}</span> -->
        <stars class="stars" value="{{ profile.company.starsST }}" disabled></stars>
      </div>
    </ng-container>
  `,
  styles: [`
    @use "sass:math";
    @use 'src/styles/variables' as *;

    $profile-card-padding: 15px;
    $profile-size-target: 80px;
    $scale: math.div($profile-size-target, $profile-image-size);

    :host {
      position: relative;
      display: block;
      border-radius: 12px;
      padding: $profile-card-padding;
      box-shadow: 1px 2px 5px 0 #ddd;
    }

    profile-image {
      position: absolute; left: 0; top: 0;
      transform: scale(0.5) translate(-10px, -30px);
    }

    .description {
      margin-top: $profile-size-target;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCardComponent {

  //we can get away with using these because this component is used inside a template
  //otherwise we will get type errors 
  @QueryProfile()
  @Input('profile')
  profile$!: number | Profile | Observable<Profile>;

  @Input()
  candidate: Candidate | null = null;

  @Input()
  @Snapshot('Job')
  job!: Job;

  employeeCount: number = 0;
  src: string = '';

  constructor(private store: Store) {}
  
  ngOnInit() {
    if( this.profile$ == void 0 ) return;

    (this.profile$ as Observable<Profile>).subscribe(profile => {
      const jobForCompany = this.store.selectSnapshot(DataQueries.getMany('JobForCompany', (profile.company as Company).jobs))
      this.employeeCount = jobForCompany.find(({job, number}) => {
        return job == (this.job as Job).id;
      })?.number || 0;
    });
  }
};