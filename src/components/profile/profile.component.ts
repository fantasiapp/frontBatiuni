import { ChangeDetectorRef, Component, HostListener, ViewChild } from "@angular/core";
import { SlidesDirective } from "src/directives/slides.directive";
import { Option } from "../options/options";
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

  constructor(private cd: ChangeDetectorRef) {
    (window as any).profile = this;
  }

  slideModifyMenu() {
    this.openMenu = false;
    this.openModifyMenu = true;
  }

  openModifyPictureMenu() {
    this.openModifyPicture = true;
  }

  @ViewChild(SlidesDirective, {static: true})
  modifySlider!: SlidesDirective;

  allLabels = ["Qualibat", "RGE", "RGE Eco Artisan", "NF", "Effinergie", "Handibat"]
    .map((name, id) => ({id, name, checked: false}));

  labels: Option[] = [];
  

  @HostListener('swipeleft')
  onSwipeLeft() {
    if ( this.openModifyMenu )
      this.modifySlider.left();
  }
  
  @HostListener('swiperight')
  onSwipeRight() {
    if ( this.openModifyMenu )
      this.modifySlider.right();
  }
};