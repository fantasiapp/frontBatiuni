import { transition, trigger } from "@angular/animations";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { Select } from "@ngxs/store";
import { BehaviorSubject } from "rxjs";
import { FadeIn } from "src/animations/fade.animation";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";

@Component({
  selector: 'main-page',
  template: `
    <ng-container *ngIf="(user$ | async) as user">
      <desktop-stickyH [user]="user"></desktop-stickyH>
      <div class="router">
        <router-outlet #outlet="outlet"></router-outlet>
      </div>
    </ng-container>
  `,
  styles: [`
    @import 'src/styles/variables';
    @import 'src/styles/mixins';
    
    :host {
      display: block;
      height: 100vh;
    }

    .router::ng-deep > * { width: 100vw; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPageComponent {

  @Select(UserState)
  user$!: BehaviorSubject<User>;

  constructor() {

  }
};