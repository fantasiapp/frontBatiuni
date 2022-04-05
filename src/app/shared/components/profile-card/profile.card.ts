import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { Company, Job, Profile } from "src/models/new/data.interfaces";
import { DataQueries, QueryProfile, Snapshot } from "src/models/new/data.state";

//maybe merge with sos ?
@Component({
  selector: 'profile-card',
  template: `
    <ng-container *ngIf="(profile$ | cast | async) as profile">
      <profile-image [profile]="profile"></profile-image>
      <div class="flex column small-space-children-margin font-Poppins description">
        <span>{{ profile.company.name || "Nom de l'entreprise" }}</span>
        <span>Propose {{ employeeCount }} {{job.name || 'Employées'}}</span>
        <span>Note générale (4.5 par 35 personnes)</span>
        <stars [value]="4.5" disabled></stars>
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
  @Snapshot('Job')
  job!: Job;

  employeeCount: number = 0;
  src: string = '';

  constructor(private store: Store) {}
  
  ngOnInit() {
    if ( this.profile$ == void 0 ) return;

    (this.profile$ as Observable<Profile>).subscribe(profile => {
      const jobForCompany = this.store.selectSnapshot(DataQueries.getMany('JobForCompany', (profile.company as Company).jobs))
      this.employeeCount = jobForCompany.find(({job, number}) => {
        return job == (this.job as Job).id;
      })?.number || 0;
    });
  }
};