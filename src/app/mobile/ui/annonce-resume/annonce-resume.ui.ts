import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Company, Post, PostRow } from "src/models/data/data.model";

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
        <span class="company">{{ company?.name || "Nom de l'entreprise" }}</span>
        <stars class="stars" [value]="company?.stars || 4"></stars>
        <span>{{ (post?.manPower) ? "Main d'oeuvre" : "Fourniture et pose" }}</span>
        <span>Du {{ toLocateDate(post?.startDate) }} Au {{toLocateDate(post?.endDate)}}</span>
        <span>{{ this.post?.amount || 0 }}</span>
      </div>
      

      <div class="needs">
        <span class="title text-emphasis">Nous avons besoin de:</span>
        <ul>
          <li>{{post?.numberOfPeople || 1}} {{post?.job?.name}} </li>
          <li>Du {{ post?.hourlyStart }} Au {{ post?.hourlyEnd }}</li>
        </ul>
        <span><small>Date d’échéance Le {{ toLocateDate(post?.dueDate) }}</small></span>
      </div>

      <div class="description">
        <span class="title text-emphasis">Description des missions</span>
        <ul>
          <li *ngFor="let detail of (post?.details || [])">{{detail.name}}</li>
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
      <span>{{collapsed ? 'Lire la suite' : 'Lire moins'}}</span>  <img src="assets/arrowdown.svg" [style.transform]="'rotate(' + (180 * +!collapsed) + 'deg)'"/>
    </div>
  </div>

  `,
  styleUrls: ['./annonce-resume.ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIAnnonceResume {
  @Input()
  collapsed: boolean = false;

  company: Company | null = null;

  private _post: Post | null = null;
  @Input()
  set post(p: Post | null) {
    this._post = p;
    this.company = this.post ? PostRow.getCompany(this.post) : null;
  }

  get post() { return this._post; }

  toLocateDate(date?: string) {
    return date ? new Date(date).toLocaleDateString('fr') : "(Non renseigné)";
  }
};