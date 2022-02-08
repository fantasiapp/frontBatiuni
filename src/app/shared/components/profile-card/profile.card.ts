import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { Store } from "@ngxs/store";
import { take } from "rxjs/operators";
import { CompanyRow, FilesRow, JobRow } from "src/models/data/data.model";
import { DownloadFile } from "src/models/user/user.actions";
import { ImageGenerator } from "../../services/image-generator.service";

@Component({
  selector: 'profile-card',
  template: `
    <profile-image [src]="src"></profile-image>
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
    this.company = CompanyRow.getById(id);
  }

  @Input('job')
  set jobId(id: number) {
    console.log('set job id', id);
    this.job = JobRow.getById(id);
  }

  company?: CompanyRow;
  job?: JobRow;
  employeeCount: number = 0;
  src: string = '';

  constructor(private cd: ChangeDetectorRef, private store: Store, private imageGenerator: ImageGenerator) {}
  
  ngOnInit() {
    console.log(this.company?.jobs);
    if ( !this.company ) return;

    this.employeeCount = this.company.jobs.find(({job, number}) => {
      console.log(this.job?.id, job.id);
      return job.id == this.job?.id;
    })?.number || 0;
    
  
    const image = this.company.files.find(file => file.nature == 'userImage');
    if ( image ) {
      if ( image.content )
        this.src = `data:image/${image.ext};base64,${image.content}`;
      else
        this.store.dispatch(new DownloadFile(image.id)).pipe(take(1))
          .subscribe(() => {
            let update = FilesRow.getById(image.id);
            this.src = `data:image/${update.ext};base64,${update.content}`
            this.cd.markForCheck();
          })
    } else {
      this.src = this.imageGenerator.generate(this.company.name[0]);
    }
  }
};