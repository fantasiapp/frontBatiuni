import { Component, Input, EventEmitter, ChangeDetectionStrategy, Output } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/common/classes";

@Component({
  selector: 'navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationMenu extends Destroy$ {
  currentIndex: number = 0;

  @Input()
  menu: MenuItem[] = [
    {name: "Home", src: "assets/navigation/st/home.svg", route: ''},
    {name: "Missions", src: "assets/navigation/st/missions.svg", route: 'missions'},
    {name: "Availibity", src: "assets/navigation/st/availabilities.svg", route: 'availabilities'},
    {name: "Profile", src: "assets/navigation/st/profile.svg", route: 'profile'},
  ];

  @Output()
  routeChange = new EventEmitter<string>();

  changeRoute(index: number) {
    if ( index == this.currentIndex ) return;
    let route = this.menu[index].route;
    this.routeChange.emit(route);
    this.router.navigate(route ? ['', 'home', route] : ['', 'home']);
  }

  constructor(private router: Router, private route: ActivatedRoute) {
    super();
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if ( !(event instanceof NavigationEnd) ) return;
      let segments = event.urlAfterRedirects.split('/');
      if ( segments.length < 2 ) this.redirectHome();
      if ( segments.length == 2 ) this.currentIndex = 0;
      if ( segments.length > 2 ) {
        let child = segments[2],
          index = this.menu.findIndex(item => item.route == child);
        
        if ( index >= 0 ) this.currentIndex = index; 
        else this.redirectHome()
      }
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