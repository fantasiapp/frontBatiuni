import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: 'online-filter-form',
  template: `
  <form class="form-control full-width">
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
        <span class="criteria">Annonces contentant des {{target}} en premier</span> <switch></switch>
      </div>
    </div>
  </form>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;    
    }
    
    switch::ng-deep .slider {
      background: #ccc;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnlineFilterForm {
  @Input()
  target: string = 'réponses';
}