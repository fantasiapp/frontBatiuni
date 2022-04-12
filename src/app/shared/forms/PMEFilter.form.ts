import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: 'pme-filter-form',
  template: `
    <ng-container [ngSwitch]="activeView">
      <form class="form-control full-width" *ngSwitchCase="0">
        <div class="form-input">
          <label style="margin-bottom:1rem;">Date de mission</label>
          <input type="date" class="form-element"/>
          <img src="assets/calendar.png"/>
        </div>

        <div class="form-input">
          <label>Adresse de chantier</label>
          <input type="text" class="form-element"/>
        </div>

        <div class="form-input" style="margin-bottom:3rem;">
          <label>Métier</label>
          <options></options>
        </div>

        <div class="form-input" style="margin-bottom:3rem;">
          <label style="margin-bottom:1rem;">Type</label>
          <div class="flex row radio-container">
            <div class="radio-item">
              <radiobox class="grow" name="job-type"></radiobox>
              <span>Main d'oeuvre</span>
            </div>
            <div class="radio-item">
              <radiobox class="grow" name="job-type"></radiobox>
              <span>Fourniture et pose</span>
            </div>
          </div>
        </div>

        <div class="form-input space-children-margin">
          <label style="margin-bottom:2rem;">Réorganiser la liste selon</label>
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
    @use 'src/styles/responsive' as *;

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
  //determine which filter is open
  @Input()
  activeView: number = 0;
  
}