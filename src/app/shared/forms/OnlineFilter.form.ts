import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { PMEFilterForm } from "./PMEFilter.form";

@Component({
  selector: 'online-filter-form',
  template: `
  <form class="form-control full-width" [formGroup]="filterForm">
    <div class="form-input form-spacer">
      <label>Date de mission</label>
      <input type="date" class="form-element" formControlName="date"/>
      <img src="assets/calendar.png"/>
    </div>

    <div class="form-input">
      <label>Adresse de chantier</label>
      <input type="text" class="form-element" formControlName="address"/>
    </div>

    <div class="form-input">
      <label>Métier</label>
      <options [options]="allJobs" formControlName="jobs"></options>
    </div>

    <div class="form-input form-spacer">
      <label class="form-title">Type</label>
      <div class="flex row radio-container">
        <div class="radio-item">
          <radiobox class="grow" onselect="true" name="job-type" formControlName="manPower"></radiobox>
          <span>Main d'oeuvre</span>
        </div>
        <div class="radio-item">
          <radiobox class="grow" onselect="false" name="job-type" formControlName="manPower"></radiobox>
          <span>Fourniture et pose</span>
        </div>
      </div>
    </div>

    <div class="form-input">
      <label class="form-title">Réorganiser la liste selon</label>
      <div class="switch-container flex center-cross">
        <span>Annonces contentant des {{target}} en premier</span> <switch class="default"></switch>
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
export class OnlineFilterForm extends PMEFilterForm{
  @Input()
  target: string = 'réponses';

}