import { ChangeDetectionStrategy, Component, ChangeDetectorRef, Input } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";
import { Store } from "@ngxs/store";
import { take } from "rxjs/operators";
import { AskRecommandation } from "src/models/new/user/user.actions";
import { Destroy$, onClickInputScroll, returnInputKeyboard } from "src/app/shared/common/classes";
import { Email } from "src/validators/persist";
import { DataQueries, DataState } from "src/models/new/data.state";
import { email } from 'src/validators/regex';
import { InfoService } from '../info/info.component';

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
      control.value == this.profileEmail ? this.disableBoutton = true : this.disableBoutton = false
      return control.value == this.profileEmail ? {SELF_RECOMMANDATION: ['profile-email']} : null    
    }
  })()
  ])}, {})

  constructor(private store: Store, private cd: ChangeDetectorRef, private info: InfoService) {
    super()
  }

  @Input() 
  profileEmail: string = ''
  
  disabled:boolean = true
  disableBoutton = false;
  token:string = ''
  view = this.store.selectSnapshot(DataState.view);

  askRecommandation () {
    if (this.emailForm.valid) {
      this.disableBoutton = true;
        this.store.dispatch(new AskRecommandation(this.emailForm.get('email')!.value, this.store.selectSnapshot(DataState.view))).pipe(take(1)).subscribe(
          async (success) => {
            document.querySelector("form")?.reset();
            this.disableBoutton = false;
            this.cd.markForCheck()
          }
        )
    }
  }
  
  returnInputKeyboard = returnInputKeyboard
  onClickInputScroll = onClickInputScroll  
}