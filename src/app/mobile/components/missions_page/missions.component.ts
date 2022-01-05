import { ChangeDetectionStrategy, Component } from "@angular/core";


@Component({
  selector: 'missions',
  templateUrl: 'missions.component.html',
  styleUrls: ['missions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MissionsComponent {
  private _activeView: number = 0;
  get activeView() { return this._activeView; }
  set activeView(value: number) {
    this._activeView = value;
  }

  openFilterMenu: boolean = false;

  missions = new Array(10);
};