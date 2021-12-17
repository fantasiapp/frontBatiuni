import { Component, ElementRef, ViewChild } from "@angular/core";
import { UISlideMenuComponent } from "../ui_component/slidemenu/slidemenu.component";
import { UISwipeupComponent } from "../ui_component/swipeup/swipeup.component";

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  @ViewChild(UISwipeupComponent, {static: true})
  swipeMenu!: UISwipeupComponent;

  @ViewChild(UISlideMenuComponent, {static: true})
  slideMenu!: UISlideMenuComponent;

  openMenu: boolean = false;
  openModifyMenu: boolean = false;
  openRatings: boolean = false;
  modifyPassword: boolean = false;
  openModifyPicture: boolean = false;
  openNotifications : boolean = false;

  constructor(private ref: ElementRef) {
    (window as any).profile = this;
  }

  slideModifyMenu() {
    this.openMenu = false;
    this.openModifyMenu = true;
  }

  openModifyPictureMenu() {
    console.log('yeah', this.openModifyPicture)
    this.openModifyPicture = true;
  }
};