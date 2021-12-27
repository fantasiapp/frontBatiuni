import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'page-header',
  template: `
  <header class="clear-margin flex column full-width space-children-margin">
    <div class="text-light-emphasis">{{name}}</div>
    <div class="pick flex row">
      <searchbar class="grow"></searchbar>
      <img src="assets/Filtrer par.svg" (click)="openFilterMenu = true"/>
    </div>
    <ul class="tabs flex row full-width font-Poppins">
      <li class="center-text" [class.active]="activeView == 0" (click)="activeViewChange.emit(activeView = 0)" ><ng-content select="[tab_0]"></ng-content></li>
      <li class="center-text" [class.active]="activeView == 1" (click)="activeViewChange.emit(activeView = 1)" ><ng-content select="[tab_1]"></ng-content></li>
    </ul>
  </header>

  <swipeup [(open)]="openFilterMenu" type="view">
    <form class="form-control full-width" view>
      <div class="form-input">
        <label>Date de validation</label>
        <input type="date"/>
        <img src="assets/calendar.png"/>
      </div>

      <div class="form-input">
        <label>Date de mission</label>
        <input type="date"/>
        <img src="assets/calendar.png"/>
      </div>

      <div class="form-input">
        <label>Adresse de chantier</label>
        <input type="date"/>
      </div>

      <div class="form-input">
        <label>Métier</label>
        <options></options>
      </div>

      <div class="form-input">
        <label>Type</label>
        <div class="flex row radio-container">
          <div class="radio-item">
            <box type="radio" class="grow" name="job-type"></box>
            Main d'oeuvre
          </div>
          <div class="radio-item">
            <box type="radio" class="grow" name="job-type"></box>
            Fourniture et pose
          </div>
        </div>
      </div>

      <div class="form-input">
        <label>Réorganiser la liste selon</label>
        <div class="switch-container flex center-cross">
          <span class="criteria">Mission clôturer</span> <switch></switch>
        </div>
        <div class="switch-container flex center-cross">
          <span class="criteria">Date de mission la plus proche à la plus lointaine</span>
          <switch></switch>
        </div>
        <div class="switch-container flex center-cross">
          <span class="criteria">Norifications suivi de chantier non lu</span> <switch></switch>
        </div>
      </div>
    </form>
  </swipeup>

  `,
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  openFilterMenu: boolean = false;
  @Input()
  activeView: number = 0;

  @Output()
  activeViewChange = new EventEmitter<number>();

  @Input()
  name: string = '{{ name }}';
};