import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {

  annonces = new Array(10).fill(0);
};