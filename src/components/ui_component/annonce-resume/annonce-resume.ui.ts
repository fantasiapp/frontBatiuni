import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";

@Component({
  selector: 'annonce-resume',
  template: `
  <div class="collapse-container" [class.is-collapsed]="collapsed">
    <div class="collapse-content space-children-margin">
      <div class="company-intro flex column center-cross space-children-margin">
          <div class="company flex center">
            <div class="offres-logo  flex center">
              <img src="assets/confirmation.svg" />
            </div>
        </div>
        <span class="company">Nom de l’entreprise</span>
        <stars class="stars" value="4.5"></stars>
        <span>Fourniture et pose</span>
        <span>Du 11/11/2021 Au 13/12/2021</span>
        <span>Montant</span>
      </div>
      

      <div class="needs">
        <span class="title text-emphasis">Nous avons besoin…….</span>
        <ul>
          <li>Besoins ( nombres de personnes + métiers)</li>
          <li>Horaires du chantier</li>
          <li>Nom du contact responsable de l’app</li>
        </ul>
        <span><small>Date d’échéance Le 24/10/2021</small></span>
      </div>

      <div class="description">
        <span class="title text-emphasis">Description des missions</span>
        <ul>
          <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do</li>
          <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
          <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore Lorem ipsum dolor sit amet, consectetur.</li>
          <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do</li>
        </ul>
      </div>

      <div class="documents">
        <span class="title text-emphasis">Documents importants</span>
        <ul>
          <li><a>Plan</a></li>
          <li><a>Document technique</a></li>
          <li><a>Descriptif de chantier</a></li>
          <li><a>Calendrier d’exécution</a></li>
        </ul>
      </div>
    </div>
    <div (click)="collapsed = !collapsed" class="collapse-controller full-width center-text">
      <span>Lire la suite</span>  <img src="assets/arrowdown.svg" [style.transform]="'rotate(' + (180 * +!collapsed) + 'deg)'"/>
    </div>
  </div>

  `,
  styleUrls: ['./annonce-resume.ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIAnnonceResume {
  @Input()
  collapsed: boolean = true;
};