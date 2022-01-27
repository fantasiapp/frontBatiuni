import { ChangeDetectionStrategy, Component, HostBinding, Input } from "@angular/core";
import { Form, FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { Store } from "@ngxs/store";
import { JobRow, PostRow } from "src/models/data/data.model";
import { Option } from "src/models/option";
import { UploadPost } from "src/models/user/user.actions";
import { Serialized } from "../common/types";
import { defaultFileUIOuput } from "../components/filesUI/files.ui";
import { InfoService } from "../components/info/info.component";

@Component({
  selector: 'ad-form',
  template: `
  <form class="full-width form-control" [formGroup]="makeAdForm">
    <h2 class="form-section-title">Besoins de l'entreprise</h2>

    <div class="form-input">
      <label>Je cherche</label>
      <input type="number" min="0" class="form-element" formControlName="numberOfPeople"/>
    </div>

    <div class="form-input">
      <label>Métier</label>
      <options type="radio" [options]="allJobs" formControlName="job"></options>
    </div>

    <div class="form-input">
      <label>Type</label>
      <div class="flex row radio-container">
        <div class="radio-item">
          <radiobox class="grow" [onselect]="true" formControlName="manPower"></radiobox>
          <span>Main d'oeuvre</span>
        </div>
        <div class="radio-item">
          <radiobox class="grow" [onselect]="false" formControlName="manPower"></radiobox>
          <span>Fourniture et pose</span>
        </div>
      </div>
    </div>

    <div class="form-input">
      <label>Date d'échéance de l'annonce</label>
      <input class="form-element" type="date" formControlName="dueDate"/>
      <img src="assets/calendar.png"/>
    </div>

    <h2 class="form-section-title">Infos chantiers</h2>
    <div class="form-input">
      <label>Adresse</label>
      <input type="text" class="form-element" formControlName="address"/>
    </div>

    <div class="form-input">
      <label>Description du chantier</label>
      <textarea class="form-element" formControlName="description" placeholder="..."></textarea>
    </div>

    <div class="form-input">
      <label class="position-relative">Détail de la prestation<img class="position-absolute add-detail" src="assets/icons/add.svg" (click)="addDetail()"/></label>
      <ol class="prestation big-space-children-margin" formArrayName="detailedPost">
        <li *ngFor="let detail of detailedPostControls; index as i" [formGroupName]="i">
           <input type="text" class="full-width form-element detail" formControlName="description"/>
        </li>
      </ol>
    </div>

    <div class="form-input">
      <label>Date du début du chantier</label>
      <input type="date" class="form-element" formControlName="startDate"/>
      <img src="assets/calendar.png"/>
    </div>

    <div class="form-input">
      <label>Date de la fin du chantier</label>
      <input type="date" class="form-element" formControlName="endDate"/>
      <img src="assets/calendar.png"/>
    </div>

    <div class="form-input">
      <label>Dates du chantier 🧪</label>
      <calendar [embedded]="false" formControlName="calendar"></calendar>
    </div>

    <div class="form-input">
      <label>Horaires du chantier</label>
      <div class="flex row space-between">
        <span>
          Du: <input type="time" class="form-element time-picker" formControlName="hourlyStart"/>
        </span>
        <span>
          Jusqu'à: <input type="time" class="form-element time-picker" formControlName="hourlyEnd"/>
        </span>
      </div>
    </div>

    <h2 class="form-section-title">Rémunération</h2>
    <div class="form-input">
      <label>Montant</label>
      <div class="flex row remuneration">
        <input type="number" min="0" style="max-height: 51px" class="grow form-element" placeholder="Montant" formControlName="amount">
        <div class="option-container">
          <options [searchable]="false" type="radio" [options]="currencies" formControlName="currency" ifEmpty="$"></options>
        </div>
      </div>
    </div>

    <div class="form-input">
      <checkbox formControlName="counterOffer"></checkbox> <span>Autoriser une contre-offre</span>
    </div>

    <h2 class="form-section-title">Documents à télécharger</h2>

    <ng-container formArrayName="documents">
      <ng-container *ngFor="let document of documentsControls; index as i" [formGroupName]="i">
        <fileinput [includeDate]="false" comment="" placeholder="" [filename]="document.get('name')!.value" formControlName="fileData"></fileinput>
      </ng-container>
    </ng-container>

    <!-- fix here, try to add name inside fileinput and fix the error thing -->
    <ng-container formArrayName="addedDocuments">
      <ng-container *ngFor="let document of addedDocumentsControls; index as i" [formGroupName]="i">
        <fileinput [includeDate]="false" comment="" placeholder="" [editName]="document.get('name')!" formControlName="fileData" (kill)="removeDocument(i)"></fileinput>
      </ng-container>
    </ng-container>

    <div class="form-input">
      <div class="form-input center-text add-field" (click)="addDocument()">
        <img src="assets/icons/add.svg"/>
        <span>Ajouter un document</span>
      </div>
    </div>

    <div *ngIf="withSubmit" class="flex row space-between full-width submit-container">
      <button class="button passive full-width" (click)="submit(true)">
        Brouillon
      </button>
      <button class="button gradient full-width" (click)="submit(false)">
        Valider
      </button>
    </div>
  </form>

  <footer class="flex row space-between sticky-footer full-width submit-container" style="z-index: 999; background-color: white;">
    <button class="button passive font-Poppins full-width" (click)="submit(true)">
      Brouillon
    </button>
    <button class="button gradient font-Poppins full-width" (click)="submit(false)">
      Valider
    </button>
  </footer>
  `,
  styles: [`
    @import 'src/styles/variables';

    :host {
      display: block;
      width: 100%;
      height: 100%;    
    }
    .remuneration > * {
      max-width: 45%;
    }
    
    textarea {
      border: 1px dashed #ccc;
      outline: none;
    }
    
    .submit-container {
      button { max-width: 45%;}
    }

    .option-container {
      margin-left: 30px;
      width: 100px;
    }

    .time-picker {
      margin-left: 20px;
    }

    .submit-container {
      height: $sticky-footer-height;
      padding: 10px;
    }

    .add-detail {
      right: $input-image-offset-x;
      top: $input-image-offset-y;
    }

    .detail {
      font: inherit;
      margin-left: 20px;
    }

    :host(.page) {
      footer {
        bottom: $navigation-height;
      }
    }

    
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MakeAdForm {
  @Input() withSubmit: boolean = false;
  @HostBinding('class.page')

  @Input() page: boolean = true;

  @Input() post!: Serialized<PostRow>;

  currencies = ['$', '€', '£'].map((currency, id) => ({id, name: currency, checked: id == 0}));

  constructor(private store: Store, private info: InfoService) {}
  
  ngOnInit() {
    const jobs = [...JobRow.instances.values()];
    this.allJobs = jobs.map(job => ({id: job.id, name: job.name, checked: false}));

    this.makeAdForm.valueChanges.subscribe(() => console.log(this.makeAdForm.value));
  }

  allJobs: Option[] = [];
  makeAdForm = new FormGroup({
    dueDate: new FormControl('2022-01-24'),
    startDate: new FormControl('2022-01-24'),
    endDate: new FormControl('2022-03-24'),
    manPower: new FormControl(0),
    job: new FormControl('', [Validators.required]),
    address: new FormControl('1 Rue Joliot Curie, 91190 Gif-sur-Yvette', [Validators.required]),
    numberOfPeople: new FormControl(1),
    counterOffer: new FormControl(false),
    hourlyStart: new FormControl('07:30'),
    hourlyEnd: new FormControl('17:30'),
    currency: new FormControl(''),
    description: new FormControl(''),
    amount: new FormControl(0),
    documents: new FormArray([
      new FormGroup({
        name: new FormControl('Plan'),
        fileData: new FormControl(defaultFileUIOuput('postdoc'))
      }),
      new FormGroup({
        name: new FormControl('Document Technique'),
        fileData: new FormControl(defaultFileUIOuput('postdoc'))
      }),
      new FormGroup({
        name: new FormControl('Descriptif du chantier'),
        fileData: new FormControl(defaultFileUIOuput('postdoc'))
      }),
      new FormGroup({
        name: new FormControl('Calendrier d\'éxecution'),
        fileData: new FormControl(defaultFileUIOuput('postdoc'))
      })
    ]),
    addedDocuments: new FormArray([

    ]),
    detailedPost: new FormArray([
      new FormGroup({description: new FormControl('Prestation 1....')})
    ]),
    calendar: new FormControl([])
  });

  get documentsControls() {
    return (this.makeAdForm.get('documents') as FormArray).controls;
  }

  get addedDocumentsControls() {
    return (this.makeAdForm.get('addedDocuments') as FormArray).controls;
  }

  get detailedPostControls() {
    return (this.makeAdForm.get('detailedPost') as FormArray).controls;
  }

  addDocument() {
    const addedDocuments = this.makeAdForm.get('addedDocuments') as FormArray;
    addedDocuments.push(new FormGroup({
      name: new FormControl(''),
      fileData: new FormControl(defaultFileUIOuput('postdoc'))
    }));
  }

  removeDocument(index: number) {
    const addedDocuments = this.makeAdForm.get('addedDocuments') as FormArray;
    addedDocuments.removeAt(index);
  }
  

  addDetail() {
    const details = this.makeAdForm.get('detailedPost') as FormArray;
    details.push(new FormGroup({
      description: new FormControl('')
    }));
  }

  submit(draft: boolean) {
    this.store.dispatch(UploadPost.fromPostForm(this.makeAdForm.value, draft)).subscribe(() => {
    this.info.show("info", "Envoi de l'annonce...", Infinity);
      this.info.show("success", "Annonce Envoyée", 2000);
    }, () => {
      this.info.show("error", "Echec de l'envoi", 5000);
    });
  }
}