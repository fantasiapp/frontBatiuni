import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { Company, Post, File, PostDetail, Job } from "src/models/new/data.interfaces";
import { DataQueries, DataState } from "src/models/new/data.state";

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
        <stars class="stars" [value]="company?.stars || 4" disabled></stars>
        <span>{{ (post?.manPower) ? "Main d'oeuvre" : "Fourniture et pose" }}</span>
        <span>Du {{ toLocateDate(post?.startDate) }} Au {{toLocateDate(post?.endDate)}}</span>
        <span>{{ this.post?.amount || 0 }} {{this.post?.currency}} </span>
      </div>
      

      <div class="needs">
        <span class="title text-emphasis">Nous avons besoin de:</span>
        <ul>
          <li>{{post?.numberOfPeople || 1}} {{job?.name || 'Employé'}} </li>
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

    <ng-container *ngIf="view == 'ST'">
      <hr class="dashed"/>
      <form class="devis form-control" [formGroup]="form">
        <h5>Pour postuler veuillez proposer votre devis</h5>

        <div class="form-input">
          <label>Montant</label>
          <div class="flex row space-between remuneration">
            <input type="number" min="0" style="max-height: 51px" class="grow form-element" placeholder="Montant" formControlName="amount">
            <div class="option-container">
              <options [searchable]="false" type="radio" [options]="devis" formControlName="devis"></options>
            </div>
          </div>
        </div>
      </form>
      <footer class="sticky-footer">
        <button class="button full-width active" [disabled]="form.invalid">
          Postuler
        </button>
      </footer>
    </ng-container>
  </div>

  `,
  styleUrls: ['./annonce-resume.ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIAnnonceResume {
  @Input()
  collapsed: boolean = false;
  collapsible: boolean = true;

  @Output()
  apply = new EventEmitter();

  @Input('collapsible')
  set collapsibleSet(value: boolean) {
    this.collapsible = value;
    if ( !value ) this.collapsed = false;
  }

  company: Company | null = null;
  job: Job | null = null;
  files: File[] = [];
  details: PostDetail[] = [];

  private _post: Post | null = null;
  get post(): any { return this._post; }
  @Input() set post(p: Post | null) {
    this._post = p;
    this.company = p ? this.store.selectSnapshot(DataQueries.getById('Company', p.company)) : null;
    this.files = p ? this.store.selectSnapshot(DataQueries.getMany('File', p.files)) : [];
    this.details = p ? this.store.selectSnapshot(DataQueries.getMany('DetailedPost', p.details)) : [];
    this.job = p ? this.store.selectSnapshot(DataQueries.getById('Job', p.job)) : null;
  }

  constructor(private store: Store, private popup: PopupService) {}

  view: 'ST' | 'PME' = 'ST';
  ngOnInit() {
    this.view = this.store.selectSnapshot(DataState.view);
  }

  openFile(file: File) {
    this.popup.openFile(file);
  }

  toLocateDate(date?: string) {
    return date ? new Date(date).toLocaleDateString('fr') : "(Non renseigné)";
  }

  devis = ['Par Heure', 'Par Jour', 'Par Semaine'].map((name, id) => ({id, name}));
  form = new FormGroup({
    amount: new FormControl(0),
    devis: new FormControl([{id: 0}])
  });
};