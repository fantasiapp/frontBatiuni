import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: 'pme-filter-form',
  template: `
    <ng-container [ngSwitch]="activeView">
      <form class="form-control full-width" *ngSwitchCase="0">
        <div class="form-input">
          <label>Date de mission</label>
          <input type="date"/>
          <img src="assets/calendar.png"/>
        </div>

        <div class="form-input">
          <label>Adresse de chantier</label>
          <input type="text"/>
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
              <span>Main d'oeuvre</span>
            </div>
            <div class="radio-item">
              <box type="radio" class="grow" name="job-type"></box>
              <span>Fourniture et pose</span>
            </div>
          </div>
        </div>

        <div class="form-input space-children-margin">
          <label>Réorganiser la liste selon</label>
          <div class="switch-container flex center-cross">
            <span class="criteria">Les brouillons les plus anciens</span> <switch class="default"></switch>
          </div>
          <div class="switch-container flex center-cross">
            <span class="criteria">Les brouillons les plus complets</span> <switch class="default"></switch>
          </div>
        </div>
      </form>
      <online-filter-form [target]="activeView == 1 ? 'réponses' : 'notifications'" *ngSwitchDefault></online-filter-form>
    </ng-container>
  `,
  styles: [`
    @import 'src/styles/responsive';

    :host {
      display: block;
      width: 100%;
    }

    form {
      
    }
    
    switch::ng-deep .slider {
      background: #ccc;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PMEFilterForm {
  @Input()
  activeView: number = 0;
}