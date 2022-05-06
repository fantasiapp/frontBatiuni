import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Store } from "@ngxs/store";
import { InviteFriend } from "src/models/new/user/user.actions";
import { Destroy$ } from "src/app/shared/common/classes";
import { Email } from "src/validators/persist";

@Component({
  selector: 'invite_friends',
  templateUrl: './invite_friends.component.html',
  styleUrls: ['./invite_friends.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InviteFriendsComponent extends Destroy$ {
  emailForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Email()
    ])
  }, {})


  constructor(private store: Store, private cd: ChangeDetectorRef) {
    super()
  }

  disabled:boolean = true

  inviteFriend () {
    console.log("inviteFriend", this.emailForm.get('email')?.value)
    if (this.emailForm.valid) {
      this.store.dispatch(new InviteFriend(this.emailForm.get('email')!.value));
    }
  }
}