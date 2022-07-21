import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  Form,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import * as moment from "moment";
import { take, takeLast } from "rxjs/operators";
import { footerTranslate } from "src/animations/footer.animation";
import { Post, Job } from "src/models/new/data.interfaces";
import { DataQueries, SnapshotAll } from "src/models/new/data.state";
import {
  DeleteFile,
  SwitchPostType,
  UploadPost,
} from "src/models/new/user/user.actions";
import { FieldType, Required } from "src/validators/verify";
import { CalendarUI, DayState } from "../components/calendar/calendar.ui";
import { defaultFileUIOuput } from "../components/filesUI/files.ui";
import { InfoService } from "../components/info/info.component";
import { ActiveViewService } from "../services/activeView.service";
import { Mobile } from "../services/mobile-footer.service";

@Component({
  selector: "ad-form",
  template: `
    <form class="full-width form-control section-host" [formGroup]="makeAdForm">
      <section class="form-section">
        <h2 class="form-section-title" #0>Besoins de l'entreprise *</h2>
        <h4 class="champs">Champs obligatoire pour passer votre annonce en ligne *</h4>

        <div class="form-input">
          <label>Métier *</label>
          <options type="radio" [options]="allJobs" formControlName="job"></options>
        </div>

        <div class="form-input">
          <label>Type *</label>
          <div class="flex row radio-container">
            <div class="radio-item">
              <radiobox
                class="grow"
                [onselect]="true"
                formControlName="manPower"
              ></radiobox>
              <span>Main d'oeuvre</span>
            </div>
            <div class="radio-item">
              <radiobox
                class="grow"
                [onselect]="false"
                formControlName="manPower"
              ></radiobox>
              <span>Fourniture et pose</span>
            </div>
          </div>
        </div>
        <div class="form-input">
          <label>Annonce valable jusqu'au : *</label>
          <input class="form-element" type="date" formControlName="dueDate" />
          <img src="assets/calendar.png" style='pointer-events: none'/>
        </div>
      </section>

      <section class="form-section">
        <h2 class="form-section-title" #1>Infos chantiers *</h2>
        <div class="form-input">
          <label>Adresse *</label>
          <input type="text" class="form-element" formControlName="address" />
        </div>

        <div class="form-input">
          <label>Description du chantier *</label>
          <textarea
            class="form-element"
            id='descriptionChantier'
            formControlName="description"
            placeholder="Ajouter une description"
          ></textarea>
        </div>

        <div class="form-input">
          <label>Effectif minimum du chantier *</label>
          <input
            min="0"
            class="form-element"
            formControlName="numberOfPeople"
          />
        </div>

        <div class="form-input">
          <label class="flex row space-between center-cross position-relative"
            >Détail de la prestation *<img
              class="add-detail"
              src="assets/icons/add.svg"
              (click)="addDetail()"
          /></label>
          <ol
            class="prestation big-space-children-margin"
            formArrayName="detailedPost"
          >
            <li
              *ngFor="let detail of detailedPostControls; index as i"
              [formGroupName]="i"
              class="position-relative"
            >
              <input
                type="text"
                class="full-width form-element detail"
                formControlName="description"
              />
              <img
                src="assets/X.svg"
                class="cancel-detail"
                (click)="cancelDetail(i)"
              />
            </li>
          </ol>
        </div>

        <div class="form-input">
          <label>Dates du chantier *</label>
          <div class="center-text">
            <switch
              (click)="eraseDateIfNecessary()"
              on="Intervalle"
              off="Jour"
              #switch
              [value]="false"
            ></switch>
          </div>
          <calendar
            [disableBeforeToday]="true"
            [useEvents]="false"
            formControlName="calendar"
            [mode]="switch.value ? 'range' : 'single'"
          ></calendar>
        </div>

        <div class="form-input">
          <label>Horaires du chantier *</label>
          <div class="flex row space-between">
            <span class="flex row">
              De:
              <input
                type="time"
                class="form-element time-picker"
                formControlName="hourlyStart"
              />
            </span>
            <span class="flex row">
              Jusqu'à:
              <input
                type="time"
                class="form-element time-picker"
                formControlName="hourlyEnd"
              />
            </span>
          </div>
        </div>
      </section>
      <section class="form-section">
        <h2 class="form-section-title" #2>Rémunération pour la mission *</h2>
        <div class="form-input">
          <label>Montant *</label>
          <div class="flex row remuneration">
            <input
              type='number'
              min="0"
              style="max-height: 51px"
              class="grow form-element"
              placeholder="Montant"
              formControlName="amount"
            /> € HT
            <!-- <div class="option-container">
              <options
                [searchable]="false"
                type="radio"
                [options]="currencies"
                formControlName="currency"
              ></options> 
            </div> -->
          </div>
        </div>

        <div class="form-input">
          <label>Condition de paiement</label>
          <textarea
            class="form-element"
            id='paymentCondition'
            formControlName="paymentCondition"
            placeholder="30% a la commande …"
          ></textarea>
        </div>

        <div class="form-input flex row">
          <checkbox type="checkbox" [value]="true" formControlName="counterOffer"></checkbox>
          <span>Autoriser une contre-offre</span>
        </div>
      </section>
      <section class="form-section">
        <h2 class="form-section-title" #3>Documents à télécharger</h2>

        <ng-container formArrayName="documents">
          <ng-container
            *ngFor="let document of documentsControls; index as i"
            [formGroupName]="i"
          >
            <fileinput
              [includeDate]="false"
              [editName]="document.get('name')!"
              (kill)="removeDocument(i)"
              comment=""
              placeholder=""
              formControlName="fileData"
            ></fileinput>
          </ng-container>
        </ng-container>

        <div class="form-input">
          <div
            class="form-input flex row center-text add-field"
            (click)="addDocument()"
          >
            <img src="assets/icons/add.svg" />
            <span>Ajouter un document</span>
          </div>
        </div>
      </section>
    </form>

    <footer
      *ngIf="showFooter"
      class="flex row space-between sticky-footer full-width submit-container"
      style="background-color: white;"
    >
      <button
        class="button passive font-Poppins full-width"
        (click)="submit($event, true)"
      >
        {{ this.post ? "Enregistrer" : "Brouillon" }}
      </button>
      <button
        class="button gradient font-Poppins full-width"
        (click)="submit($event, false)"
        [disabled]="invalid"
      >
        Passer en ligne
      </button>
    </footer>
  `,
  styles: [`
    @use 'src/styles/variables' as *;
    @use 'src/styles/mixins' as *;

    :host {
      display: block;
      width: 100%;
      height: unset
      /* height: 100%;    
      height: max-content;
      height: fit-content */
    }
    .remuneration > * {
      max-width: 45%;
    }
    
    textarea {
      border: 1px dashed #ccc;
      outline: none;
      width: 100%;
      min-height: 80px;
      border: 2px solid #aaa;
      outline: none;
      border-radius: 3px;
      resize: vertical
    }

    input{
      /* margin-top: 20px; */
    }

    .champs {
        font-size: small;
        color: #A2A2A2;
      }

    switch{
      margin-top: 20px;
      margin-bottom: 20px;
    }

    .option-container {
      margin-left: 30px;
      width: 100px;
    }

      textarea {
        border: 1px dashed #ccc;
        outline: none;
        width: 100%;
        min-height: 80px;
        border: 2px solid #aaa;
        outline: none;
        border-radius: 3px;
        padding-left:1rem;
        padding-right: 1rem;
        padding-top: 0.5rem;
        font-size: small;
      }

      .option-container {
        margin-left: 30px;
        width: 100px;
      }

      .time-picker {
        margin-left: 10px;
      }

      .submit-container {
        /* height: 4.5rem; */
        padding-left: 10px;
        padding-right: 10px;
        padding-top: 10px;
        /* position: relative; */
        button {
          padding: 0 0.5rem;
          max-width: 45%;
          height: calc(4.5rem - 20px);
          /* height: 100%; */
          display: flex;
          flex-grow: 1;
          justify-content: center;
          align-items: center;
          z-index: 2;
        }

        &::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background: white;
          height: calc(
            4.5rem + #{$navigation-height} + env(safe-area-inset-bottom)
          );
          z-index: 1;
          pointer-events: none;
        }
      }

      .add-detail {
        right: $input-image-offset-x;
        top: $input-image-offset-y;
      }

      .detail {
        font: inherit;
      }

      :host(.page) {
        footer {
          bottom: $navigation-height;
          &.footerHide {
            visibility: hidden
          }
        }
      }

      ol {
        list-style: none;
      }

      .cancel-detail {
        padding: 10px;
        margin-top: -5px;
        position: absolute;
        top: 0px;
        right: 5px;
        transform-origin: center;
        transform: scale(0.7);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DatePipe
  ]
})
export class MakeAdForm {
  @HostBinding("class.page")
  @Input()
  page: boolean = true;

  //T_T
  @ViewChild("0") public first!: ElementRef;
  @ViewChild("1") public second!: ElementRef;
  @ViewChild("2") public third!: ElementRef;
  @ViewChild("3") public last!: ElementRef;

  @Output() done = new EventEmitter();

  @ViewChild(CalendarUI, { static: false }) calendar!: CalendarUI;

  @SnapshotAll("Job")
  allJobs!: Job[];

  private _post: Post | null = null;
  get post() {
    return this._post;
  }

  @Input()
  set post(p: Post | null) {
    if (!p || p == this._post) {
      return;
    }

    this._post = p;
    //load values
    const postDetails = this.store.selectSnapshot(
      DataQueries.getMany("DetailedPost", p.details)
    );
    const files = this.store.selectSnapshot(
      DataQueries.getMany("File", p.files)
    );
    //fill form
    this.makeAdForm.get("dueDate")?.setValue(p.dueDate);
    this.makeAdForm.get("manPower")?.setValue(p.manPower);
    this.makeAdForm.get("job")?.setValue(p.job ? [{ id: p.job }] : []);
    this.makeAdForm.get("address")?.setValue(p.address);
    this.makeAdForm.get("numberOfPeople")?.setValue(p.numberOfPeople);
    this.makeAdForm.get("counterOffer")?.setValue(p.counterOffer);
    this.makeAdForm.get("hourlyStart")?.setValue(p.hourlyStart);
    this.makeAdForm.get("hourlyEnd")?.setValue(p.hourlyEnd);
    this.makeAdForm.get("currency")?.setValue(this.currencies.filter((currency) => currency.name == p.currency));
    this.makeAdForm.get("description")?.setValue(p.description);
    this.makeAdForm.get("paymentCondition")?.setValue(p.paymentCondition);
    this.makeAdForm.get("amount")?.setValue(p.amount);

    //load details
    const detailsForm = this.makeAdForm.get("detailedPost")! as FormArray;
    detailsForm.clear();

    for (const detail of postDetails)
      detailsForm.push(
        new FormGroup({ description: new FormControl(detail.content) })
      );

    //load dates
    //heavens forgive me for this atrocy
    let daystates: DayState[] = [];
    if (typeof p.dates === "object" && !Array.isArray(p.dates)) {
      const ArrayDate: any = Object.values(p.dates);
      daystates = ArrayDate.map((date: any[]) => {
        return {
          date: date[0] as string,
          availability: "selected",
        };
      });
    } else {
      daystates = this.store
        .selectSnapshot(DataQueries.getMany("DatePost", p.dates))
        .map(({ date: name }) => ({ date: name, availability: "selected" }));
    }

    this.makeAdForm.get("calendar")?.setValue(daystates);
    this.calendar?.viewCurrentDate();

    //load files
    const filesForm = this.makeAdForm.get("documents")! as FormArray;
    filesForm.clear();
    for (const file of files)
      filesForm.push(
        new FormGroup({
          name: new FormControl(file.name),
          fileData: new FormControl(file),
        })
      );
  }

  //get put checked allJobs
  currencies = ["$", "€", "£"].map((currency, id) => ({ id, name: currency }));
  commonDocuments = [
    "Plan",
    "Document Technique",
    "Descriptif du chantier",
    "Calendrier d'éxecution",
  ];

  showFooter: boolean = true;

  constructor(
    private store: Store,
    private info: InfoService,
    public mobile: Mobile,
    private cd: ChangeDetectorRef,
    private router: Router,
    private datePipe: DatePipe,
    private activeViewService: ActiveViewService
  ) {
    // setInterval(()=>{
    //   this.mobile.test1()
    // }, 1000)
  }

  ngOnInit() {
    this.mobile.footerStateSubject.subscribe((b) => {
      this.showFooter = b;
      this.cd.detectChanges();
    });
  }

  // Valide un brouillon/annonce qui si la date d'echeance est dans le futur, c'est plus commode
  dueDateValidator(control: AbstractControl): { [key: string]: any } | null {
    // console.log('due date', control);
    if (control.value && moment(control.value) <= moment()) {
      return { dueDateInvalid: true };
    }
    return null;
  }

  makeAdForm: FormGroup = new FormGroup({
    dueDate: new FormControl(moment(new Date(Date.now())).add(1,'days').format('YYYY-MM-DD'), [
      Validators.required,
      this.dueDateValidator,
    ]),
    manPower: new FormControl(0),
    job: new FormControl([], [Validators.required]),
    address: new FormControl("1 Rue Joliot Curie, 91190 Gif-sur-Yvette", [Validators.required,]),
    numberOfPeople: new FormControl("", [FieldType("number"), Validators.required]),
    counterOffer: new FormControl(false),
    hourlyStart: new FormControl("07:30:00"),
    hourlyEnd: new FormControl("17:30:00"),
    currency: new FormControl(this.currencies.filter((currency) => currency.name == "€")),
    description: new FormControl(""),
    amount: new FormControl(1, [FieldType("number")]),
    documents: new FormArray(this.commonDocuments.map((name) => new FormGroup({name: new FormControl(name),fileData: new FormControl(defaultFileUIOuput("post")),}))),
    detailedPost: new FormArray([]),
    calendar: new FormControl([]),
    paymentCondition: new FormControl("")
  });
  get invalid() {
    const calendar = this.makeAdForm.get("calendar")
    return !this.makeAdForm.valid || calendar?.value.length == 0;
  }

  get documentsControls() {
    return (this.makeAdForm.get("documents") as FormArray).controls;
  }

  get detailedPostControls() {
    return (this.makeAdForm.get("detailedPost") as FormArray).controls;
  }

  addDocument() {
    const documents = this.makeAdForm.get("documents") as FormArray;
    documents.push(new FormGroup({ name: new FormControl(""), fileData: new FormControl(defaultFileUIOuput("post")),}));
  }

  removeDocument(index: number) {
    let documents = this.makeAdForm.get("documents") as FormArray,
    item = documents.at(index).value.fileData;
    documents.at(index).value.fileData = {content: '', expirationDate: '', ext: '???', name: 'Veuillez télécharger un document', nature: 'post'}
    if (item.id) this.store.dispatch(new DeleteFile(item.id));
  }

  addDetail() {
    const details = this.makeAdForm.get("detailedPost") as FormArray;
    details.push(
      new FormGroup({
        description: new FormControl("", [Required()]),
      })
    );
  }

  cancelDetail(index: number) {
    const details = this.makeAdForm.get("detailedPost") as FormArray;
    details.removeAt(index);
  }

  eraseDateIfNecessary() {
  }

  submit(e:any, draft: boolean) {
    // e.preventDefault()
    console.log('draft', draft, "and the value", this.makeAdForm.value);
    if (this.post) {
      // le brouillon existe deja
      let files = this.store.selectSnapshot(DataQueries.getMany('File', this.post.files))
      if (!draft) {
        this.info.show("info", "Mise en ligne de l'annonce...", Infinity);
        const action = this.makeAdForm.touched ? UploadPost.fromPostForm(this.makeAdForm.value, draft, this.post.id, files) : new SwitchPostType(this.post.id);
        console.log("action", action)
        this.store.dispatch(action).pipe(take(1)).subscribe(() => {
              this.info.show("success", "Annonce mise en ligne", 2000);
              this.activeViewService.emitActiveViewChangeEvent(1)
              this.done.emit();
            },
            () => {
              this.info.show("error", "Echec", 5000);
            }
          );
      } else {
        this.info.show("info", "Enregistrement de l'annonce...", Infinity);
        this.store
          .dispatch(
            UploadPost.fromPostForm(this.makeAdForm.value, draft, this.post.id, files)
          )
          .pipe(take(1))
          .subscribe(
            () => {
              this.info.show("info", "Envoi de l'annonce...", Infinity);
              this.info.show("success", "Annonce Enregistrée", 2000);
              this.done.emit();
            },
            () => {
              this.info.show("error", "Echec de l'enregistrement", 5000);
            }
          );
      }
      //switch type
    } else {
      this.info.show("info", "Envoi de l'annonce...", Infinity);
      const calendar: any[] = this.makeAdForm.get("calendar")!.value;
      this.store.dispatch(UploadPost.fromPostForm(this.makeAdForm.value, draft)).pipe(take(1)).subscribe(
          () => {
            this.info.show("success", "Annonce Envoyée", 2000);
            this.done.emit();
            if (!draft) {
              this.activeViewService.emitActiveViewChangeEvent(1)
            }
            this.router.navigate(["", "home"]);
          },
          () => {
            this.info.show("error", "Echec de l'envoi", 5000);
          }
        );
    }
  }
}
