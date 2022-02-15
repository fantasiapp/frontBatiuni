import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { Logout } from "src/models/auth/auth.actions";
import { Profile } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";
import * as UserActions from "src/models/new/user/user.actions";
import { InfoService } from "src/app/shared/components/info/info.component";
import { take } from "rxjs/operators";
import { animate, style, transition, trigger } from "@angular/animations";


@Component({
  selector: 'profile',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateX(-100%)', opacity: 0}),
          animate('300ms', style({transform: 'translateX(0)', opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateX(0)', opacity: 1}),
          animate('200ms', style({transform: 'translateX(-100%)', opacity: 0}))
        ])
      ]
    )
  ],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePageComponent {
  abonnementTabs: boolean = false;
  activeView: number = 0;
  tabView: number = 0;
  factures = new Array(10).fill(0);
  showResponsiveFilters: boolean = false;

  setView(view: number) { this.activeView = view; }

  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  constructor(private store: Store, private cd: ChangeDetectorRef, private info: InfoService,) {}
  ngOnInit() {
    this.profile$.subscribe(console.log)
  }
  logout() {
    this.store.dispatch(new Logout());
  }
  profileForm!: FormGroup ;
  actionBinding(data:any) {
    this.profileForm = data;
  }
  modifyProfileDesktop(binding:any) {
    const form = this.profileForm;
    const action = this.store.dispatch(new UserActions.ModifyUserProfile({profile: this.store.selectSnapshot(DataQueries.currentProfile), form}));
    this.info.show("info", "Mise à jour en cours...", Infinity);
    action.pipe(take(1))
      .subscribe(success => {
        // this.openModifyMenu = false;
        this.info.show("success", "Profil modifié avec succès", 2000);
        (form as FormGroup).markAsPristine(); (form as FormGroup).markAsUntouched();
        this.cd.markForCheck();
      },
      err => {
        this.info.show("error", "Erreur lors du modification du profil", 5000);
        this.cd.markForCheck();
      });
  }
  changePasswordDesktop(form: FormGroup) {
    let { oldPwd, newPwd, confirmPwd } = form.value;
    // console.log("this is the oasswird, oldPwd", )
    let req = this.store.dispatch(new UserActions.ChangePassword(oldPwd ,newPwd));
    req.subscribe(
      success => { this.info.show("success", "Mot de passe changé avec succès", 2000); },
      error => { this.info.show("error", "Erreur lors du changement du mot de passe"); }
    )
  }
}