import { ChangeDetectionStrategy, Component } from "@angular/core";
import { DistanceSliderConfig, SalarySliderConfig } from "src/common/config";

@Component({
  selector: 'sos-filter-form',
  template: `
  <form class="form-control full-width">
  <div class="form-input">
      <label>Métier</label>
      <options></options>
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
      <label>Réorganiser la liste selon</label>
      <div class="switch-container flex center-cross">
        <span class="criteria">La meilleur note à la moins bonne</span> <switch class="default"></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Les profils les plus complets</span> <switch class="default"></switch>
      </div>
      <div class="switch-container flex center-cross">
        <span class="criteria">Les profils affichés comme disponibles</span> <switch class="default"></switch>
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
export class SOSFilterForm {
  imports = { DistanceSliderConfig, SalarySliderConfig };
}