import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'ad-form',
  template: `
  <form class="full-width form-control">
    <h2 class="form-section-title">Besoins de l'entreprise</h2>

    <div class="form-input">
      <label>Je cherche</label>
      <input type="text"/>
    </div>

    <div class="form-input">
      <label>Métier</label>
      <options [showChosenItems]="false"></options>
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
      <label>Date d'échéance de l'annonce</label>
      <input type="date"/>
      <img src="assets/calendar.png"/>
    </div>

    <h2 class="form-section-title">Infos chantiers</h2>
    <div class="form-input">
      <label>Adresse</label>
      <input type="text"/>
    </div>

    <div class="form-input">
      <label>Description du chantier</label>
      <textarea></textarea>
    </div>

    <div class="form-input">
      <label>Détail de la prestation</label>
      <input type="text" placeholder="Exemple:"/>
      <img src="assets/icons/add.svg"/>
    </div>

    <div class="form-input">
      <label>Dates</label>
      <input type="date"/>
      <img src="assets/calendar.png"/>
    </div>

    <div class="form-input">
      <label>Horaires du chantier</label>
      <div class="flex row space-between">
        <span>
          Du: <input type="time"/>
        </span>
        <span>
          Jusqu'à: <input type="time"/>
        </span>
      </div>
    </div>

    <h2 class="form-section-title">Rémunération</h2>
    <div class="form-input">
      <label>Montant</label>
      <div class="flex row space-between remuneration">
        <input type="number" placeholder="Montant">
        <select>
          <option *ngFor="let currency of imports.currencies" [value]="currency">{{currency}}</option>
        </select>
      </div>
    </div>

    <div class="form-input">
      <box type="checkbox"></box> <span>Autoriser une contre-offre</span>
    </div>

    <h2 class="form-section-title">Documents à télécharger</h2>
    
    <fileinput [includeDate]="false" comment="" placeholder="" filename="Plan"></fileinput>
    <fileinput [includeDate]="false" comment="" placeholder="" filename="Document technique"></fileinput>
    <fileinput [includeDate]="false" comment="" placeholder="" filename="Descriptif du chantier"></fileinput>
    <fileinput [includeDate]="false" comment="" placeholder="" filename="Calendrier d'exécution"></fileinput>


    <div class="form-input center-text add-field">
      <img src="assets/icons/add.svg"/>
      <span>Ajouter un document</span>
    </div>

    <div class="flex row space-between full-width submit-container">
      <button class="button passive full-width">
        Brouillon
      </button>
      <button class="button gradient full-width">
        Valider
      </button>
    </div>
  </form>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;    
    }
    .remuneration > * {
      max-width: 45%;
    }
    
    .submit-container {
      button { max-width: 45%;}
    }

    .submit-container {
      position: fixed;
      left: 0; bottom: 0;
      height: 70px;
      padding: 10px 20px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MakeAdForm {
  imports = {
    currencies: ['$', '€', '£']
  }
}