import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from "@ngxs/store";
import { InviteFriend } from "src/models/new/user/user.actions";

@Component({
  selector: 'invite_friends',
  templateUrl: './invite_friends.component.html',
  styleUrls: ['./invite_friends.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InviteFriendsComponent {

  constructor(private store: Store) {}

  disabled:boolean = true

  inviteFriend () {
    let email = document.getElementById("inviteFriendInput") as HTMLTextAreaElement;
    console.log("inviteFriend", email!.value)
    this.store.dispatch(new InviteFriend(email!.value));
  }
}