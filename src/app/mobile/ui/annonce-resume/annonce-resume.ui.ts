import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Store } from "@ngxs/store";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { Company, Post, File, PostDetail } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";

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
        <span>{{ this.post?.amount || 0 }} {{this.post?.currency}} </span>
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
        <p>{{post?.description || 'Description de la mission'}}</p>
        <ul>
          <li *ngFor="let detail of details">{{detail.content}}</li>
        </ul>
      </div>

      <div class="documents">
        <span class="title text-emphasis">Documents importants</span>
        <ul>
          <li *ngFor="let file of files">
            <a (click)="openFile(file)">{{file.name}}</a>
          </li>
        </ul>
      </div>
    </div>
    <div *ngIf="collapsible" (click)="collapsed = !collapsed" class="collapse-controller full-width center-text">
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
  collapsible: boolean = true;

  @Input('collapsible')
  set collapsibleSet(value: boolean) {
    this.collapsible = value;
    if ( !value ) this.collapsed = false;
  }

  company: Company | null = null;

  private _post: Post | null = null;
  get post(): any { return this._post; }
  @Input() set post(p: Post | null) {
    this._post = p;
    this.company = p ? this.store.selectSnapshot(DataQueries.getById('Company', p.company)) : null;
    this.files = p ? this.store.selectSnapshot(DataQueries.getMany('File', p.files)) : [];
    this.details = p ? this.store.selectSnapshot(DataQueries.getMany('DetailedPost', p.details)) : [];
  }

  files: File[] = [];
  details: PostDetail[] = [];

  constructor(private store: Store, private popup: PopupService) {}

  openFile(file: File) {
    this.popup.openFile(file);
  }

  toLocateDate(date?: string) {
    return date ? new Date(date).toLocaleDateString('fr') : "(Non renseigné)";
  }
};