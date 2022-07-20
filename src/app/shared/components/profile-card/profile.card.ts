import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { MyStore } from "src/app/shared/common/classes";
import { Observable } from "rxjs";
import {
  Candidate,
  Company,
  Job,
  Mission,
  Profile,
} from "src/models/new/data.interfaces";
import { DataQueries, QueryProfile, Snapshot } from "src/models/new/data.state";

//maybe merge with sos ?
@Component({
  selector: "profile-card",
  template: `
    <ng-container *ngIf="profile$ | cast | async as profile">
      <!-- <app-banner [candidate]="candidate"]></app-banner> -->
      <div class="flex column font-Poppins description">
        <profile-image [profile]="profile"></profile-image>
        <span>{{ profile.company.name || "Nom de l'entreprise" }}</span>
        <span>Propose {{ employeeCount }} {{ job.name || "Employées" }}</span>
        <span
          >Note générale ({{ profile.company.starsST }}/5 par
          {{ numberOfQuotations }} personnes)</span
        >
        <span *ngIf="candidate?.amount"
          >Contre Offre : {{ candidate!.amount }} €</span
        >
        <stars [isRatings]="profile.company.starsST ? true : false" class="stars" value="{{ profile.company.starsST ? profile.company.starsST : profile.company.starsRecoST }}"  disabled></stars>
      </div>
    </ng-container>
  `,
  styles: [
    `
      @use "sass:math";
      @use "src/styles/variables" as *;

      $profile-card-padding: 15px;
      $profile-size-target: 80px;
      $scale: math.div($profile-size-target, $profile-image-size);

      :host {
        position: relative;
        display: block;
        border-radius: 12px;
        
        font-family: "Roboto", sans-serif;
        box-shadow: 10px 24px 54px #33333340;
        font-size: 0.875rem;
      }

      /* :host::before{
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        box-shadow: 10px 24px 54px #33333340;
        border-radius: 12px;
      } */

      profile-image {
        /* transform: scale(0.5) translate(-10px, -30px); */
        width: 3.5rem;
        height: 3.5rem;
      }

      .description {
        padding: $profile-card-padding;
        row-gap: 0.375rem;
        span:nth-child(2) {
          color: #999999;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCardComponent {
  //we can get away with using these because this component is used inside a template
  //otherwise we will get type errors
  @QueryProfile()
  @Input("profile")
  profile$!: number | Profile | Observable<Profile>;

  @Input()
  candidate: Candidate | null = null;

  @Input()
  @Snapshot("Job")
  job!: Job;

  employeeCount: number = 0;
  src: string = "";

  numberOfQuotations: number = 0;

  // (this.profile$ as Observable<Profile>).subscribe(profile => {
  //   const company = profile.company
  //   let candidates = this.store.selectSnapshot(DataQueries.getAll('Candidate')).map((candidate)=>{return candidate})
  //   test = 1
  //   // this.store.selectSnapshot(DataQueries.getAll('Candidate').map((candidate)=>{

  //   // })
  // })
  //   return 3
  // }

  constructor(private store: MyStore) {}

  ngOnInit() {
    if (this.profile$ == void 0) return;
    (this.profile$ as Observable<Profile>).subscribe((profile) => {
      if (profile?.company) {
        const jobForCompany = this.store.selectSnapshot(
          DataQueries.getMany(
            "JobForCompany",
            (profile.company as Company).jobs
          )
        );
        this.employeeCount =
          jobForCompany.find(({ job, number }) => {
            return job == (this.job as Job).id;
          })?.number || 0;
        this.numberOfQuotations = 0;
        this.store
          .selectSnapshot(DataQueries.getAll("Mission"))
          .forEach((mission) => {
            if (mission.isClosed && mission.subContractor == profile.company.id)
              this.numberOfQuotations++;
          });
      }
    });
  }
}
