import { ChangeDetectionStrategy, Component } from "@angular/core";
import { DistanceSliderConfig, SalarySliderConfig } from "src/common/config";

@Component({
  selector: 'st-filter-form',
  template: `
  <form class="form-control full-width">
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
      <label>Dans un rayon autour de:</label>
      <ngx-slider [options]="imports.DistanceSliderConfig"></ngx-slider>
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

    <div class="form-input">
      <label>Estimation de salaire:</label>
      <ngx-slider [options]="imports.SalarySliderConfig" [value]="0" [highValue]="10000"></ngx-slider>
    </div>

    <div class="form-input space-children-margin">
      <label>Taille de l'entreprise</label>
      <div class="radio-item">
        <box type="checkbox" class="grow" name="job-type"></box>
        <span>Moins que 10 salariés</span>
      </div>
      <div class="radio-item">
        <box type="checkbox" class="grow" name="job-type"></box>
        <span>Entre 11 et 20 salariés</span>
      </div>
      <div class="radio-item">
        <box type="checkbox" class="grow" name="job-type"></box>
        <span>Entre 20 et 25 salariées</span>
      </div>
      <div class="radio-item">
        <box type="checkbox" class="grow" name="job-type"></box>
        <span>Entre 50 et 100 salariés</span>
      </div>
      <div class="radio-item">
        <box type="checkbox" class="grow" name="job-type"></box>
        <span>Plus de 100 salariés</span>
      </div>
    </div>

    <div class="form-input space-children-margin">
      <label>Réorganiser la liste selon</label>
      <div class="switch-container flex center-cross">
        <span class="criteria">Annonces déjà vus uniquement</span> <switch></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Annonces favoristes uniquement</span> <switch></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Annonces déjà postulées uniquement</span> <switch></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Annonces ouverte à contre-proposition</span> <switch></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Date d'échéance de l'annonce de la plus proche à la plus lointaine</span> <switch></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Date de publication la plus récente à la plus anciennce</span> <switch></switch>
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
export class STFilterForm {
  imports = { DistanceSliderConfig, SalarySliderConfig };
}