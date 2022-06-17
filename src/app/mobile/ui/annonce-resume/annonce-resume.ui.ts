import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Action, Store } from "@ngxs/store";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import {
  Company,
  User,
  Post,
  File,
  PostDetail,
  Job,
  Mission,
  Candidate,
  Profile,
} from "src/models/new/data.interfaces";
import { DataQueries, DataState, QueryProfile } from "src/models/new/data.state";
import { Destroy$ } from "src/app/shared/common/classes";
import { InfoService } from "src/app/shared/components/info/info.component";
import { FieldType } from "src/validators/verify";
import { Observable } from "rxjs";

export type ApplyForm = {
  amount: number;
  devis: string;
};

@Component({
  selector: "annonce-resume",
  template: `
    <div
      *ngIf="post"
      class="collapse-container"
      [class.is-collapsed]="collapsed"
    >
      <div class="collapse-content space-children-margin">
        <div
          class="company-intro flex column center-cross space-children-margin"
        >
          <profile-image
            [profile]="isSuiviPME ? profileST! : { company: company!, user: user }"
            (click)="openProfile()"
          ></profile-image>
          <span class="company">{{ isSuiviPME ? subContractor!.name : company!.name }}</span>
          <stars
            (click)="openRatings = true"
            class="stars"
            value="{{ isSuiviPME ? subContractor!.starsST : company!.starsPME }}"
            disabled
          ></stars>
          <span class="ManPower">{{
            post.manPower ? "Main d'oeuvre" : "Fourniture et pose"
          }}</span>
          <span class='missionDates'
            >Du {{ toLocateDate(post.startDate) }} Au
            {{ toLocateDate(post.endDate) }}</span
          >
          <span class='amount'>{{ this.amountOrigin || 0 }} {{ this.post.currency }} HT par mission </span>
        </div>

        <div class="resume-mission">
          <span class="title  ">Résumé de la mission</span>
          <ul>
            <li>
              {{ post?.numberOfPeople || 1 }} {{ job?.name || "Employé" }}
            </li>
            <li>Horaires du chantier : {{ post.hourlyStart }} - {{ post.hourlyEnd }}</li>
            <li>Nom du contact : {{post.contactName }}</li>
          </ul>

        </div>

        <div class="needs">
          <span class="title  ">Nous avons besoin...</span>
          <ul>
            <li>
              {{ post?.numberOfPeople || 1 }} {{ job?.name || "Employé" }}
            </li>
            <li>Horaires du chantier : {{ post.hourlyStart }} - {{ post.hourlyEnd }}</li>
            <li>Date de présence : {{ toLocateDate(post.startDate) }} -
            {{ toLocateDate(post.endDate) }}</li>
            <li>Adresse du chantier : {{ hideAdress(post?.address) }}</li>
            <li>Nom du contact : {{post.contactName }}</li>
          </ul>
          <span class='date'> Date d’échéance Le {{ toLocateDate(post?.dueDate) }} 
          </span>
        </div>

        <div class="description">
          <span class="title  ">Description des missions</span>
          <p>{{ post.description }}</p>
        </div>

        <div class="detail">
          <span class="title  ">Détail de la prestation</span>
          <ul>
            <li *ngFor="let detail of details">{{ detail.content }}</li>
          </ul>
        </div>

        <div class="documents">
          <span class="title  ">Documents importants</span>
          <ul>
            <li *ngFor="let file of files">
              <a (click)="openFile(file)">{{ file.name }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div
        *ngIf="collapsible"
        (click)="collapsed = !collapsed"
        class="collapse-controller full-width center-text"
        id='collapse'
      >
        <span>{{ collapsed ? "Lire la suite" : "Lire moins" }}</span>
        <img
          src="assets/arrowdown.svg"
          [style.transform]="'rotate(' + 180 * +!collapsed + 'deg)'"
        />
      </div>

      <rating
        [view]="'ST'"
        [profile]="isSuiviPME ? profileST! : { company: company!, user: user }"
        [(open)]="openRatings"
        [ngClass]="{ open: openRatings }"
      ></rating>
      <slide-profile
       
        [isSuiviPME]="isSuiviPME"
        [(open)]="slideProfileOpen"
        [profile]="isSuiviPME ? profileST! : { company: company!, user: user }"
        [post]="post"
        [ngClass]="{ open: slideProfileOpen }"
      ></slide-profile>
      <ng-container *ngIf="application && view == 'ST'">
        <hr class="dashed" />
        <form
          *ngIf="post.counterOffer"
          class="devis form-control"
          [formGroup]="form"
        >
          <h2>Pour postuler veuillez proposer votre devis</h2>

          <div class="form-input">
            <label>Montant</label>
            <div class="flex row space-between remuneration">
              <input
                min="0"
                style="max-height: 51px"
                class="grow form-element"
                [placeholder]="post.amount"
                formControlName="amount"
              /> € HT
            </div>
          </div>
        </form>
        <footer class="sticky-footer">
          <button
            class="button full-width active"
            (click)="showPopUp()"
            [disabled]="disableValidation"
          >
            Postuler
          </button>
        </footer>
      </ng-container>
    </div>
  `,
  styleUrls: ["./annonce-resume.ui.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIAnnonceResume extends Destroy$ {
  @Input()
  collapsed: boolean = false;
  collapsible: boolean = true;
  defaultValue: boolean = true;

  @Input("collapsible")
  set collapsibleSet(value: boolean) {
    this.collapsible = value;
    if (!value) this.collapsed = false;
  }

  @Input("isSuiviPME")
  isSuiviPME: boolean = false

  @Input()
  application: boolean = true;

  @Input()
  hideExactAdress: boolean = false;

  company: Company | null = null;
  subContractor: Company | null = null;
  user: User | null = null;
  job: Job | null = null;
  files: File[] = [];
  details: PostDetail[] = [];
  openRatings: boolean = false;
  profile = this.store.selectSnapshot(DataQueries.currentProfile);
  profileST: Profile | null = null

  get disableValidation(): boolean {
    if (this.hasPostulated) {
      this.info.show(
        "info",
        "Vous avez déjà postulé à cette annonce",
        Infinity
      );
    }
    return (
      this.hasPostulated || (this.amount == null && this.post.counterOffer && !this.defaultValue) 
    );
  }

  get hasPostulated() {
    let companiesId = this.post.candidates.map((id: number) => {
      let candidate = this.store.selectSnapshot(
        DataQueries.getById("Candidate", id)
      );
      return candidate!.company;
    });
    return companiesId.includes(this.profile.company.id);
  }

  //rename this to item of type compatible with both Post and Mission
  private _post: Post | null = null;
  get post(): any {
    return this._post;
  }

  get amount(): number | null {
    if (this.form && this.form.get("amount")?.value) {
      this.defaultValue  = false
      return this.form.get("amount")!.value;
    }
    this.defaultValue = true
    return null;
  }

  get amountOrigin() {
    return this._post?.amount;
  }

  searchCandidate(post: Post): Candidate | null {
    const candidates = post.candidates;
    const companyId = this.profile.company.id;
    let goodCandidate = null;
    if (candidates) candidates.forEach((candidateId) => {
        let candidate = this.store.selectSnapshot(
        DataQueries.getById("Candidate", candidateId)
      );
      if (candidate?.company == companyId) {
        goodCandidate = candidate;
      }
    });
  
    return goodCandidate;
  }

  slideProfileOpen: boolean = false;
  openProfile() {
    this.slideProfileOpen = true;
  }

  @Input("post") set post(p: Post | null) {
    this._post = p;
    this.company = p
      ? this.store.selectSnapshot(DataQueries.getById("Company", p.company))
      : null;
    this.subContractor = p
      ? this.store.selectSnapshot(DataQueries.getById("Company", p.subContractor))
      : null;
    if (this.subContractor) {this.profileST = this.store.selectSnapshot(DataQueries.getProfileById(this.subContractor!.id))}
    this.files = p
      ? this.store.selectSnapshot(DataQueries.getMany("File", p.files))
      : [];
    this.details = p
      ? this.store.selectSnapshot(
          DataQueries.getMany("DetailedPost", p.details)
        )
      : [];
    this.job = p
      ? this.store.selectSnapshot(DataQueries.getById("Job", p.job))
      : null;
  }

  constructor(
    private store: Store,
    private popup: PopupService,
    private info: InfoService
  ) {
    super();
  }

  view: "ST" | "PME" = "ST";
  ngOnInit() {
    this.view = this.store.selectSnapshot(DataState.view);
  }

  ngOnChanges() {
    this.form = new FormGroup({
      amount: new FormControl(this.amount),
      devis: new FormControl([this.devis[0]]),
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  openFile(file: File) {
    this.popup.openFile(file);
  }

  toLocateDate(date?: string) {
    return date ? new Date(date).toLocaleDateString("fr") : "(Non renseigné)";
  }

  @Output()
  apply = new EventEmitter<ApplyForm>();

  devis = ["Par Heure", "Par Jour", "Par Semaine"].map((name, id) => ({
    id,
    name,
  }));
  form = new FormGroup({
    amount: new FormControl(this.amount, [FieldType("number")]),
    devis: new FormControl([this.devis[0]]),
  });

  showPopUp(){
    this.popup.onApply(this.post, this);
  }

  onApply() {
    if(this.defaultValue) {
      this.form.get("amount")?.setValue(this.post.amount);
    }
    const formValue = this.form.value;
    if (this.form.value == 0 || !this.form.value.amount) {
      this.info.show("error", "Montant incorrect", 2000);
      return;
    }
    this.apply.emit({
      amount: formValue.amount,
      devis: formValue.devis[0].name,
    });
    this.popup.onApplyConfirm(this);
  }

  // Permet de reset la value lorsque l'on sort d'une annonce, notament lorsqu'on passe d'une annonce a une autre ou le montant afficher restait le meme
  close() {
    this.form.get("amount")?.setValue(null);
  }

  open() {
    let amount;
    if (this._post) amount = this.searchCandidate(this._post)?.amount;
    else amount = null;
    this.form.get("amount")?.setValue(amount);
  }

  hideAdress(adress?: string) {
    if (adress && this.hideExactAdress) {
      return adress!.replace(/\d+/, "").trim();
    } else {
      return adress;
    }
  }
}
