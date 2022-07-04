import { ChangeDetectionStrategy, Component, ChangeDetectorRef, Input } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";
import { Store } from "@ngxs/store";
import { take } from "rxjs/operators";
import { AskRecommandation } from "src/models/new/user/user.actions";
import { Destroy$, returnInputKeyboard } from "src/app/shared/common/classes";
import { Email } from "src/validators/persist";
import { DataQueries, DataState } from "src/models/new/data.state";
import { email } from 'src/validators/regex';

@Component({
  selector: 'ask_recommandation',
  templateUrl: './ask_recommandation.component.html',
  styleUrls: ['./ask_recommandation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AskRecommandationComponent extends Destroy$ {
  emailForm = new FormGroup({email: new FormControl('', [Validators.required, Email(), 
  (() => {
    return (control: AbstractControl) => {
      return control.value == this.profileEmail ? {SELF_RECOMMANDATION: ['profile-email']} : null    
    }
  })()
  ])}, {})

  constructor(private store: Store, private cd: ChangeDetectorRef) {
    super()
  }

  @Input() 
  profileEmail: string = ''
  
  disabled:boolean = true
  token:string = ''

  askRecommandation () {
    if (this.emailForm.valid) {
      this.store.dispatch(new AskRecommandation(this.emailForm.get('email')!.value, this.store.selectSnapshot(DataState.view))).pipe(take(1)).subscribe(
        async (success) => {
          this.cd.markForCheck()
        }
      )
    }
  }
  
  returnInputKeyboard = returnInputKeyboard
}