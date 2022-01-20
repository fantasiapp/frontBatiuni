import { Component, Input, EventEmitter, ChangeDetectionStrategy, Output, ChangeDetectorRef } from "@angular/core";
import { NavigationCancel, NavigationEnd, Router } from "@angular/router";
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/common/classes";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";

const STMenu = [
  {name: "Home", src: "assets/navigation/st/home.svg", route: '',},
  {name: "Missions", src: "assets/navigation/st/missions.svg", route: 'missions'},
  {name: "Availibity", src: "assets/navigation/st/availabilities.svg", route: 'availabilities'},
  {name: "Profile", src: "assets/navigation/st/profile.svg", route: 'profile'},
];

const PMEMenu = [
  {name: "Home", src: "assets/navigation/st/home.svg", route: ''},
  {name: "Créer une Annonce", src: "assets/navigation/pme/make.svg", route: 'make'},
  {name: "SOS", src: "assets/navigation/pme/sos.svg", route: 'sos'},
  {name: "Profile", src: "assets/navigation/st/profile.svg", route: 'profile'}
];

@Component({
  selector: 'navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationMenu extends Destroy$ {
  currentIndex: BehaviorSubject<number> = new BehaviorSubject(0);
  mobileView = window.innerWidth <= 768;

  @Input()
  menu: BehaviorSubject<MenuItem[]> = new BehaviorSubject(STMenu);

  @Output()
  routeChange = new EventEmitter<string>();

  @Select(UserState)
  user$!: Observable<User>;

  private changeRouteOnMenu(menu: MenuItem[], index: number) {
    let route = menu[index].route;
    this.routeChange.emit(route);
    this.router.navigate(route ? ['', 'home', route] : ['', 'home']);
  }

  changeRoute(index: number) {
    if ( index == this.currentIndex.getValue() ) return;
    let menu = this.menu.getValue();
    this.changeRouteOnMenu(menu, index);
  }

  constructor(private router: Router) {
    super();
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if ( !(event instanceof NavigationEnd) ) return;
      let menu = this.menu.getValue();
      let segments = event.urlAfterRedirects.split('/');
      console.log(segments);
      if ( segments.length < 2 ) this.redirectHome();
      if ( segments.length == 2 ) this.currentIndex.next(0);
      if ( segments.length > 2 ) {
        let child = segments[2],
          index = menu.findIndex(item => item.route == child);
        
        if ( index >= 0 ) { this.currentIndex.next(index); }
        else this.redirectHome()
      }
    });

    this.user$.pipe(takeUntil(this.destroy$)).subscribe((user: User) => {
      const nextMenu = user.viewType ? PMEMenu : STMenu;
      this.menu.next(nextMenu);
      this.changeRouteOnMenu(nextMenu, this.currentIndex.getValue());
    });
  }

  redirectHome() {
    this.router.navigate(['', 'home']);
  }
} 

export interface MenuItem {
  name: string // Nom de la page / tab
  src: string  // src de la photo non active
  route: string;
}