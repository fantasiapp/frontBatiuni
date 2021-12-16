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

  constructor(private ref: ElementRef) {
    (window as any).profile = this;
  }

  slideModifyMenu() {
    this.ref.nativeElement.scrollTop = 0;
    this.openMenu = false;
    this.openModifyMenu = true;
  }
};