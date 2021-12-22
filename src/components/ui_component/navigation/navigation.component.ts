import { Component, Input, EventEmitter, ChangeDetectionStrategy, Output } from "@angular/core";

@Component({
  selector: 'navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationMenu {
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
    this.currentIndex = index;
    this.routeChange.emit(this.menu[index].route);
  }
} 

export interface MenuItem {
  name: string // Nom de la page / tab
  src: string  // src de la photo non active
  route: string;
}