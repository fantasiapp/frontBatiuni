import { ChangeDetectionStrategy, Component, HostListener, Input } from "@angular/core";
import { ExtendedProfileComponent } from "src/app/mobile/components/extended-profile/extended-profile.component";
import { Company, CompanyRow, FilesRow, Job, JobRow } from "src/models/data/data.model";
import { SlidemenuService } from "../slidemenu/slidemenu.component";

@Component({
  selector: 'profile-card',
  template: `
    <profile-image [company]="company!"></profile-image>
    <div class="flex column small-space-children-margin font-Poppins description">
      <span>{{ company?.name || "Nom de l'entreprise" }}</span>
      <span>Propose {{ employeeCount }} {{job?.name || 'Employées'}}</span>
      <span>Note générale (4.5 par 35 personnes)</span>
      <stars [value]="4.5"></stars>
    </div>
    
    
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileCardComponent {
  @Input('company')
  set companyId(id: number) {
    this.company = CompanyRow.getById(id).serialize();
  }

  @Input('job')
  set jobId(id: number) {
    this.job = JobRow.getById(id)?.serialize();
  }

  company?: Company;
  job?: Job;
  employeeCount: number = 0;
  src: string = '';

  constructor() {}
  
  ngOnInit() {
    console.log(this.company?.jobs);
    if ( !this.company ) return;

    this.employeeCount = this.company.jobs.find(({job, number}) => {
      console.log(this.job, job.id);
      return job.id == this.job?.id;
    })?.number || 0;
    
  }
};