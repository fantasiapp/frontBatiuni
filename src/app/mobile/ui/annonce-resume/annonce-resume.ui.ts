import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Store } from "@ngxs/store";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import { Company, User, Post, File, PostDetail, Job, Mission, Candidate } from "src/models/new/data.interfaces";
import { DataQueries, DataState } from "src/models/new/data.state";
import { Destroy$ } from "src/app/shared/common/classes";

export type ApplyForm = {
  amount: number;
  devis: string;
};

@Component({
  selector: 'annonce-resume',
  template: `
  <div *ngIf="post" class="collapse-container" [class.is-collapsed]="collapsed">
    <div class="collapse-content space-children-margin">
      <div class="company-intro flex column center-cross space-children-margin">
        <span *ngIf="candidates" [attr.data-notification-number]="candidates" class="notification"></span>
        <profile-image [profile]="{company: company!, user: user}"></profile-image>
        <span class="company">{{ company!.name }}</span>
        <stars (click)='openRatings = true' class="stars" value="{{ company!.starsPME }}" disabled></stars>
        <span>{{ (post.manPower) ? "Main d'oeuvre" : "Fourniture et pose" }}</span>
        <span>Du {{ toLocateDate(post.startDate) }} Au {{toLocateDate(post.endDate)}}</span>
        <span>{{ this.amountOrigin || 0 }} {{this.post.currency}} </span>
      </div>

      <div class="needs">
        <span class="title  ">Nous avons besoin de:</span>
        <ul>
          <li>{{post?.numberOfPeople || 1}} {{job?.name || 'Employé'}} </li>
          <li>Du {{ post.hourlyStart }} Au {{ post.hourlyEnd }}</li>
        </ul>
        <span><small>Date d’échéance Le {{ toLocateDate(post?.dueDate) }}</small></span>
      </div>

      <div class="description">
        <span class="title  ">Description des missions</span>
        <p>{{post.description}}</p>
        <ul>
          <li *ngFor="let detail of details">{{detail.content}}</li>
        </ul>
      </div>

      <div class="documents">
        <span class="title  ">Documents importants</span>
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

    <rating [profile]="{company: company!, user: user}" [(open)]="openRatings" [ngClass]="{'open' : openRatings}"></rating>

    <ng-container *ngIf="application && view == 'ST'">
      <hr class="dashed"/>
      <form  *ngIf="post.counterOffer" class="devis form-control" [formGroup]="form">
        <h2>Pour postuler veuillez proposer votre devis</h2>

        <div class="form-input">
          <label>Montant</label>
          <div class="flex row space-between remuneration">
            <input type="number" min="0" style="max-height: 51px" class="grow form-element" placeholder="Montant" formControlName="amount">
          </div>
        </div>
      </form>
      <footer class="sticky-footer">
        <button class="button full-width active" (click)="onApply()" [disabled]="disableValidation">
          Postuler
        </button>
      </footer>
    </ng-container>
  </div>

  `,
  styleUrls: ['./annonce-resume.ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIAnnonceResume extends Destroy$ {
  @Input()
  collapsed: boolean = false;
  collapsible: boolean = true;

  @Input('collapsible')
  set collapsibleSet(value: boolean) {
    this.collapsible = value;
    if ( !value ) this.collapsed = false;
  }

  @Input()
  application: boolean = true;

  company: Company | null = null;
  user: User | null = null
  job: Job | null = null;
  files: File[] = [];
  details: PostDetail[] = [];
  openRatings: boolean = false;
  profile = this.store.selectSnapshot(DataQueries.currentProfile)

  get disableValidation ():boolean {
    console.log("disableValidation", this.amount, this.hasPostulated)
    return this.hasPostulated || this.amount == null
  }

  get hasPostulated () {
    let companiesId = this.post.candidates.map((id:number) => {
      let candidate = this.store.selectSnapshot(DataQueries.getById('Candidate', id))
      return candidate!.company
    })
    return companiesId.includes(this.profile.company.id)
  }

  //rename this to item of type compatible with both Post and Mission
  private _post: Post | null = null;
  get post(): any { return this._post; }

  get amount(): number | null{
    if (this.form && this.form.get('amount')?.value) {
      return this.form.get('amount')!.value
    }
    if (this._post?.counterOffer) {
      let candidate = this.searchCandidate(this._post!)
      console.log("amount", candidate?.amount, typeof(candidate?.amount))
      this.form.get("amount")?.setValue(candidate?.amount ? candidate!.amount : null)
      return candidate?.amount ? candidate!.amount : null
    }
    return null
  }

  get amountOrigin () {
    if (this._post?.counterOffer) {
      return this._post.amount
    }
    return null
  }

  get candidates(): number {
    let possibleCandidates:number = 0
    if (this._post) {
      const candidatesIds = this._post!.candidates || [],
        candidates = this.store.selectSnapshot(DataQueries.getMany('Candidate', candidatesIds))
        candidates.forEach((candidate) => {
          if (!candidate.isRefused && !candidate.isViewed) possibleCandidates++
        })
    }
    return possibleCandidates
  }

  searchCandidate(post:Post): (Candidate | null) {
    const candidates = post.candidates
    const companyId = this.profile.company.id
    console.log("search", candidates, companyId)
    let goodCandidate = null
    candidates.forEach((candidateId) => {
      let candidate = this.store.selectSnapshot(DataQueries.getById('Candidate', candidateId))
      if (candidate?.company == companyId) {
        goodCandidate = candidate
      }
    })
    return goodCandidate
  }

  @Input('post') set post(p: Post | null) {
    this._post = p;
    this.company = p ? this.store.selectSnapshot(DataQueries.getById('Company', p.company)) : null;
    this.files = p ? this.store.selectSnapshot(DataQueries.getMany('File', p.files)) : [];
    this.details = p ? this.store.selectSnapshot(DataQueries.getMany('DetailedPost', p.details)) : [];
    this.job = p ? this.store.selectSnapshot(DataQueries.getById('Job', p.job)) : null;
  }

  constructor(private store: Store, private popup: PopupService) {
    super()
  }

  view: 'ST' | 'PME' = 'ST';
  ngOnInit() {
    this.view = this.store.selectSnapshot(DataState.view)
  }

  ngOnChange() {
    console.log("ngOnChange")
    this.form = new FormGroup({
      amount: new FormControl(this.amount),
      devis: new FormControl([this.devis[0]])
    });
  }

  ngOnDestroy(): void {
    console.log("ngdestroy")
    super.ngOnDestroy();
  }

  openFile(file: File) {
    this.popup.openFile(file);
  }

  toLocateDate(date?: string) {
    return date ? new Date(date).toLocaleDateString('fr') : "(Non renseigné)";
  }

  @Output()
  apply = new EventEmitter<ApplyForm>();

  devis = ['Par Heure', 'Par Jour', 'Par Semaine'].map((name, id) => ({id, name}));
  form = new FormGroup({
    amount: new FormControl(this.amount),
    devis: new FormControl([this.devis[0]])
  });

  onApply() {
    const formValue = this.form.value;
    this.apply.emit({
      amount: formValue.amount,
      devis: formValue.devis[0].name
    });
    console.log("apply")
  }
};