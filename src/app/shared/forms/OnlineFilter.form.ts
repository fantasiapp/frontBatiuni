import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: 'online-filter-form',
  template: `
  <form class="form-control full-width">
    <div class="form-input">
      <label>Date de mission</label>
      <input type="date" class="form-element"/>
      <img src="assets/calendar.png"/>
    </div>

    <div class="form-input">
      <label>Adresse de chantier</label>
      <input type="date" class="form-element"/>
    </div>

    <div class="form-input">
      <label>Métier</label>
      <options></options>
    </div>

    <div class="form-input">
      <label>Type</label>
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
      <label>Réorganiser la liste selon</label>
      <div class="switch-container flex center-cross">
        <span class="criteria">Annonces contentant des {{target}} en premier</span> <switch class="default"></switch>
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