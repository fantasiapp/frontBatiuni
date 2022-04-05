import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Select } from "@ngxs/store";
import { Observable } from "rxjs";
import { Profile } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";

@Component({
  selector: 'main-page',
  template: `
    <ng-container *ngIf="(profile$ | async) as profile">
      <desktop-stickyH [profile]="profile"></desktop-stickyH>
      <div class="router">
        <router-outlet #outlet="outlet"></router-outlet>
      </div>
    </ng-container>
  `,
  styles: [`
    @use 'src/styles/variables' as *;
    @use 'src/styles/mixins' as *;
    
    :host {
      display: block;
      height: 100vh;
    }

    .router::ng-deep > * { width: 100vw; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPageComponent {

  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  constructor() {

  }
};