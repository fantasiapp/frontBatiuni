import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { CompanyRow } from "src/models/data/data.model";

@Component({
  selector: 'profile-card',
  template: `
    <profile-image></profile-image>
  `,
  styles: [`
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileCardComponent {
  @Input('company')
  set companyId(id: number) {
    this.company = CompanyRow.getById(id);
  }

  company?: CompanyRow;
  
  ngOnInit() {
    console.log(this.company);
  }
};