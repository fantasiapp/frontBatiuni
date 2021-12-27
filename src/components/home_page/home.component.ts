import { Component, ChangeDetectionStrategy, SimpleChanges } from "@angular/core";

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  activeView: number = 0;
  annonces = new Array(10);

  openAdFilterMenu: boolean = false;
};