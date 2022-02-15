import { ChangeDetectionStrategy, Component, HostListener, Input } from "@angular/core";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { Company, Job } from "src/models/new/data.interfaces";
import { DataQueries, Snapshot } from "src/models/new/data.state";
import { SlidemenuService } from "../slidemenu/slidemenu.component";

@Component({
  selector: 'profile-card',
  template: `
    <ng-container *ngIf="(company | snapshot) as company">
      <ng-container *ngIf="(job | snapshot) as job">
        <profile-image [profile]="company.id"></profile-image>
        <div class="flex column small-space-children-margin font-Poppins description">
          <span>{{ company.name || "Nom de l'entreprise" }}</span>
          <span>Propose {{ employeeCount }} {{job.name || 'Employées'}}</span>
          <span>Note générale (4.5 par 35 personnes)</span>
          <stars [value]="4.5"></stars>
        </div>
      </ng-container>
    </ng-container>
  `,
  styles: [`
    @use "sass:math";
    @import 'src/styles/variables';

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
      transform: scale(0.5) translate(-10px, -30px) rotate(45deg);
    }

    .description {
      margin-top: $profile-size-target;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCardComponent {
  
  @Snapshot('Company')
  @Input()
  company!: number | Company;

  @Snapshot('Job')
  @Input()
  job!: number | Job;

  employeeCount: number = 0;
  src: string = '';

  constructor(private store: Store) {}
  
  ngOnInit() {
    if ( this.company !== void 0 ) return;

    const jobForCompany = this.store.selectSnapshot(DataQueries.getMany('JobForCompany', (this.company as Company).jobs))
    this.employeeCount = jobForCompany.find(({job, number}) => {
      return job == (this.job as Job).id;
    })?.number || 0;
  }
};