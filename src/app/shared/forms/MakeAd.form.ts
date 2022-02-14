import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { Store } from "@ngxs/store";
import { take } from "rxjs/operators";
import { Post, Job } from "src/models/new/data.interfaces";
import { DataQueries, SnapshotAll } from "src/models/new/data.state";
import { DeleteFile, SwitchPostType, UploadPost } from "src/models/user/user.actions";
import { Required } from "src/validators/verify";
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
        <li *ngFor="let detail of detailedPostControls; index as i" [formGroupName]="i" class="position-relative">
          <input type="text" class="full-width form-element detail" formControlName="description"/>
          <img src="assets/X.svg" class="cancel-detail" (click)="cancelDetail(i)"/>
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
      <label>Dates du chantier (N'est pas branché) 🧪</label>
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

    <h2 class="form-section-title" id="anass">Rémunération</h2>
    <div class="form-input">
      <label>Montant</label>
      <div class="flex row remuneration">
        <input type="number" min="0" style="max-height: 51px" class="grow form-element" placeholder="Montant" formControlName="amount">
        <div class="option-container">
          <options [searchable]="false" type="radio" [options]="currencies" formControlName="currency"></options>
        </div>
      </div>
    </div>

    <div class="form-input">
      <checkbox formControlName="counterOffer"></checkbox>
      <span>Autoriser une contre-offre</span>
    </div>

    <h2 class="form-section-title">Documents à télécharger</h2>

    <ng-container formArrayName="documents">
      <ng-container *ngFor="let document of documentsControls; index as i" [formGroupName]="i">
        <fileinput [includeDate]="false" [editName]="document.get('name')!" (kill)="removeDocument(i)" comment="" placeholder="" formControlName="fileData"></fileinput>
      </ng-container>
    </ng-container>

    <div class="form-input">
      <div class="form-input center-text add-field" (click)="addDocument()">
        <img src="assets/icons/add.svg"/>
        <span>Ajouter un document</span>
      </div>
    </div>
  </form>

  <footer class="flex row space-between sticky-footer full-width submit-container" style="background-color: white;">
    <button class="button passive font-Poppins full-width" (click)="submit(true)" [disabled]="!makeAdForm.valid">
      {{this.post ? 'Enregistrer' : 'Brouillon'}}
    </button>
    <button class="button gradient font-Poppins full-width" (click)="submit(false)" [disabled]="!makeAdForm.valid">
      Passer en ligne
    </button>
  </footer>
  `,
  styles: [`
    @import 'src/styles/variables';
    @import 'src/styles/mixins';

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
      button { max-width: 45%;}
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
        @include with-set-safe-area(bottom, bottom, $navigation-height);
      }
    }

    ol {
      list-style: none;
    }

    .cancel-detail {
      position: absolute;
      top: 0px; right: 5px;
      transform-origin: center;
      transform: scale(0.7);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MakeAdForm {
  @HostBinding('class.page')
  @Input() page: boolean = true;
  
  @Output() done = new EventEmitter();
  
  @SnapshotAll('Job')
  allJobs!: Job[];

  private _post: Post | null = null;
  get post() { return this._post; }
  
  @Input()
  set post(p: Post | null) {
    console.log(p);
    if ( !p || p == this._post ) {
      this.info.alignWith('header_search');
      return;
    };

    this._post = p;
    //load values
    console.log('post:', p);
    const postDetails = this.store.selectSnapshot(DataQueries.getMany('DetailedPost', p.details));
    const files = this.store.selectSnapshot(DataQueries.getMany('File', p.files));
    //fill form
    this.makeAdForm.get('dueDate')?.setValue(p.dueDate);
    this.makeAdForm.get('startDate')?.setValue(p.startDate);
    this.makeAdForm.get('endDate')?.setValue(p.endDate);
    this.makeAdForm.get('manPower')?.setValue(p.manPower);
    this.makeAdForm.get('job')?.setValue(p.job ? [{id: p.job}] : []);
    this.makeAdForm.get('address')?.setValue(p.address);
    this.makeAdForm.get('numberOfPeople')?.setValue(p.numberOfPeople);
    this.makeAdForm.get('counterOffer')?.setValue(p.counterOffer);
    this.makeAdForm.get('hourlyStart')?.setValue(p.hourlyStart);
    this.makeAdForm.get('hourlyEnd')?.setValue(p.hourlyEnd);
    this.makeAdForm.get('currency')?.setValue(this.currencies.filter(currency => currency.name == p.currency));
    this.makeAdForm.get('description')?.setValue(p.description);
    this.makeAdForm.get('amount')?.setValue(p.amount);
    
    //load details
    const detailsForm = this.makeAdForm.get('detailedPost')! as FormArray;
    detailsForm.clear();
    for ( const detail of postDetails )
      detailsForm.push(new FormGroup({description: new FormControl(detail.content)}));
    
    //load files
    const filesForm = this.makeAdForm.get('documents')! as FormArray;
    filesForm.clear();
    console.log(files);
    for ( const file of files )
      filesForm.push(new FormGroup({
        name: new FormControl(file.name),
        fileData: new FormControl(file)
      }));
  };

  //get put checked allJobs
  currencies = ['$', '€', '£'].map((currency, id) => ({id, name: currency}));
  commonDocuments = ['Plan', 'Document Technique', 'Descriptif du chantier', 'Calendrier d\'éxecution'];
  
  constructor(private store: Store, private info: InfoService) {}


  makeAdForm = new FormGroup({
    dueDate: new FormControl('2022-01-24'),
    startDate: new FormControl('2022-01-24'),
    endDate: new FormControl('2022-03-24'),
    manPower: new FormControl(0),
    job: new FormControl([], [Validators.required]),
    address: new FormControl('1 Rue Joliot Curie, 91190 Gif-sur-Yvette', [Validators.required]),
    numberOfPeople: new FormControl(1),
    counterOffer: new FormControl(false),
    hourlyStart: new FormControl('07:30:00'),
    hourlyEnd: new FormControl('17:30:00'),
    currency: new FormControl(this.currencies.filter(currency => currency.name == '€')),
    description: new FormControl(''),
    amount: new FormControl(0),
    documents: new FormArray(
      this.commonDocuments.map(name => new FormGroup({
        name: new FormControl(name),
        fileData: new FormControl(defaultFileUIOuput('post'))
      }))
    ),
    detailedPost: new FormArray([

    ]),
    calendar: new FormControl([])
  });

  get documentsControls() {
    return (this.makeAdForm.get('documents') as FormArray).controls;
  }

  get detailedPostControls() {
    return (this.makeAdForm.get('detailedPost') as FormArray).controls;
  }

  addDocument() {
    const documents = this.makeAdForm.get('documents') as FormArray;
    documents.push(new FormGroup({
      name: new FormControl(''),
      fileData: new FormControl(defaultFileUIOuput('post'))
    }));
  }

  removeDocument(index: number) {
    const documents = this.makeAdForm.get('documents') as FormArray,
      item = documents.at(index).value.fileData;
    documents.removeAt(index);
    console.log('remove ', item);
    if ( item.id ) this.store.dispatch(new DeleteFile(item.id));
  }
  

  addDetail() {
    const details = this.makeAdForm.get('detailedPost') as FormArray;
    details.push(new FormGroup({
      description: new FormControl('', [Required()])
    }));
  }

  cancelDetail(index: number) {
    const details = this.makeAdForm.get('detailedPost') as FormArray;
    details.removeAt(index);
  }

  submit(draft: boolean) {
    if ( this.post ) {
      if ( !draft ) {
        this.info.show("info", "Mise en ligne de l'annonce...", Infinity);
        this.store.dispatch(new SwitchPostType(this.post.id)).pipe(take(1)).subscribe(() => {
          this.info.show("success", "Annonce mise en ligne", 2000);
          this.done.emit();
        }, () => {
          this.info.show("error", "Echec", 5000);
        });
      } else {
        this.info.show("info", "Enregistrement de l'annonce...", Infinity);
        this.store.dispatch(UploadPost.fromPostForm(this.makeAdForm.value, draft, this.post.id)).pipe(take(1)).subscribe(() => {
        this.info.show("info", "Envoi de l'annonce...", Infinity);
          this.info.show("success", "Annonce Enregistrée", 2000);
          this.done.emit();
        }, () => {
          this.info.show("error", "Echec de l'enregistrement", 5000);
        });
      }
      //switch type
    } else {
      this.info.show("info", "Envoi de l'annonce...", Infinity);
      this.store.dispatch(UploadPost.fromPostForm(this.makeAdForm.value, draft)).pipe(take(1)).subscribe(() => {
        this.info.show("success", "Annonce Envoyée", 2000);
        this.done.emit();
      }, () => {
        this.info.show("error", "Echec de l'envoi", 5000);
      });
    }
  }
}