import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Store } from "@ngxs/store";
import { take } from "rxjs/operators";
import { AskRecommandation } from "src/models/new/user/user.actions";
import { Destroy$ } from "src/app/shared/common/classes";
import { Email } from "src/validators/persist";
import { DataQueries } from "src/models/new/data.state";
import { email } from 'src/validators/regex';

@Component({
  selector: 'ask_recommandation',
  templateUrl: './ask_recommandation.component.html',
  styleUrls: ['./ask_recommandation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AskRecommandationComponent extends Destroy$ {
  emailForm = new FormGroup({email: new FormControl('', [Validators.required, Email()])}, {})

  constructor(private store: Store, private cd: ChangeDetectorRef) {
    super()
  }

  disabled:boolean = true
  token:string = ''

  askRecommandation () {
    if (this.emailForm.valid) {
      this.store.dispatch(new AskRecommandation(this.emailForm.get('email')!.value, true)).pipe(take(1)).subscribe(
        async (success) => {
          this.token = this.store.selectSnapshot(DataQueries.currentProfile).user.tokenFriend
          this.cd.markForCheck()
          this.store.dispatch(new AskRecommandation(this.emailForm.get('email')!.value, false))
        }
      )
    }
  }

}