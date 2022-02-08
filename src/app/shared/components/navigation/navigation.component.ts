import { Component, Input, EventEmitter, ChangeDetectionStrategy, Output, ChangeDetectorRef } from "@angular/core";
import { NavigationCancel, NavigationEnd, Router } from "@angular/router";
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";

const STMenu = [
  { name: "Home", src: "assets/navigation/st/home.svg", route: '', },
  { name: "Missions", src: "assets/navigation/st/missions.svg", route: 'missions' },
  { name: "Availibity", src: "assets/navigation/st/availabilities.svg", route: 'availabilities' },
  { name: "Profile", src: "assets/navigation/st/profile.svg", route: 'profile' },
];

const PMEMenu = [
  { name: "Home", src: "assets/navigation/st/home.svg", route: '' },
  { name: "Créer une Annonce", src: "assets/navigation/pme/make.svg", route: 'make' },
  { name: "SOS", src: "assets/navigation/pme/sos.svg", route: 'sos' },
  { name: "Profile", src: "assets/navigation/st/profile.svg", route: 'profile' },
];

@Component({
  selector: 'navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationMenu extends Destroy$ {
  currentIndex: BehaviorSubject<number> = new BehaviorSubject(0);
  private segments: string[] = [];
  mobileView = window.innerWidth <= 768;

  menu: BehaviorSubject<MenuItem[]>;

  @Output()
  routeChange = new EventEmitter<string>();

  private changeRouteOnMenu(menu: MenuItem[], index: number) {
    let route = menu[index].route;
    this.routeChange.emit(route);
    this.router.navigate(route ? ['', 'home', route, ...this.segments] : ['', 'home']);
    this.segments = [];
  }

  changeRoute(index: number) {
    if (index == this.currentIndex.getValue()) return;
    let menu = this.menu.getValue();
    this.changeRouteOnMenu(menu, index);
  }

  constructor(private router: Router, private store: Store) {
    super();
    this.menu = new BehaviorSubject(this.store.selectSnapshot<User>(UserState).viewType ? PMEMenu : STMenu);
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      console.log(event)
      if (!(event instanceof NavigationEnd)) return;
      let menu = this.menu.getValue();
      let segments = event.urlAfterRedirects.split('/');
      this.segments = segments.slice(3);
      if (segments.length < 2) this.redirectHome();
      if (segments.length == 2) this.currentIndex.next(0);
      if (segments.length > 2) {
        let child = segments[2],
          index = menu.findIndex(item => item.route == child);

        this.segments = segments.slice(3); //save ids and params to use them later
        if (index >= 0) { this.currentIndex.next(index); }
        else this.redirectHome()
      }
    });
  }

  private getIndexFromUrl(url: string) {
    let menu = this.menu.getValue();
    let segments = url.split('/');
    this.segments = segments.slice(3);
    if (segments.length < 2) this.redirectHome();
    if (segments.length == 2) this.currentIndex.next(0);
    if (segments.length > 2) {
      let child = segments[2],
        index = menu.findIndex(item => item.route == child);

      this.segments = segments.slice(3); //save ids and params to use them later
      if (index >= 0) { this.currentIndex.next(index); }
      else this.redirectHome()
    }
  }

  @Select(UserState)
  user$!: Observable<User>;

  ngOnInit() {
    this.user$.pipe(takeUntil(this.destroy$)).subscribe((user: User) => {
      const nextMenu = user.viewType ? PMEMenu : STMenu;
      this.menu.next(nextMenu);
      this.getIndexFromUrl(this.router.url);
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