import { Component } from "@angular/core";

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  openMenu: boolean = false;
  openModifyMenu: boolean = false;

  slideModifyMenu() {
    this.openMenu = false;
    this.openModifyMenu = true;
  }
};