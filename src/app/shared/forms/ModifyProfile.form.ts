import { ChangeDetectionStrategy, Component, HostListener, Input, ViewChild, EventEmitter, Output, ChangeDetectorRef, SimpleChanges } from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { Camera } from "@capacitor/camera";
import { Option } from "src/models/option";
import { SlidesDirective } from "../directives/slides.directive";
import { defaultFileUIOuput } from "../components/filesUI/files.ui";
import { FieldType } from "src/validators/verify";
import { PopupService } from "../components/popup/popup.component";
import { InfoService } from "../components/info/info.component";
import { Store } from "@ngxs/store";
import { DataQueries, SnapshotAll, SnapshotArray } from "src/models/new/data.state";
import { Job, Label, File, Profile, User, Company, LabelForCompany, JobForCompany } from "src/models/new/data.interfaces";
import { SpacingPipe } from "../pipes/spacing.pipe";

@Component({
  selector: 'modify-profile-form',
  template: `
  <div [slides]="[modifyPage1, modifyPage2, modifyPage3]" [(index)]="index" type="template"
    [animate]="animate"></div>

  <ng-template #modifyPage1>
    <section class="full-width section">
      <form class="form-control" [formGroup]="form">
        <h3 class="form-title font-Roboto">
          Infos personelles:
        </h3>
        <div class="form-input">
          <label>Nom du contact</label>
          <input class="form-element" type="text" formControlName="UserProfile.lastName" />
        </div>
        <div class="form-input">
          <label>Prénom du contact</label>
          <input class="form-element" type="text" formControlName="UserProfile.firstName" />
        </div>
        <div class="form-input">
          <label>Adresse e-mail contact</label>
          <input class="form-element" type="email" formControlName="UserProfile.userName" />
        </div>
        <div class="form-input">
          <label>Téléphone de l'entreprise</label>
          <input class="form-element" type="tel" formControlName="UserProfile.Company.companyPhone" />
        </div>
        <div class="form-input">
          <label>Téléphone portable</label>
          <input class="form-element" type="tel" formControlName="UserProfile.cellPhone" />
        </div>
      </form>
    </section>
  </ng-template>

  <ng-template #modifyPage2>
    <section class="full-width section">
      <form class="full-width form-control" [formGroup]="form">
        <h3 class="form-title font-Roboto">
          Infos entreprise:
        </h3>
        <div class="form-input">
          <label>Nom de l'entreprise</label>
          <input class="form-element" type="text" formControlName="UserProfile.Company.name" />
        </div>
        <div class="form-input">
          <label>N SIRET</label>
          <input class="form-element" type="text" formControlName="UserProfile.Company.siret" />
        </div>
        <!-- change the structure -->
        <!-- all elements are selected -->
        <div class="form-input metiers">
          <ng-container *ngIf="!addingField; else addfield_tpl">
            <label>Métiers</label>
            <ng-container formArrayName="UserProfile.Company.JobForCompany">
              <span class="position-relative number form-element" *ngFor="let control of companyJobsControls; index as i">
                <ng-container [formGroupName]="i">
                  <span class="number-name">{{control.get('job')!.value.name}}</span>
                  <div class="position-absolute number-container">
                    <number formControlName="number"></number>
                  </div>
                </ng-container>
              </span>
            </ng-container>
            <div (click)="addingField = true" class="center-text add-field">
              <img src="assets/icons/add.svg"/>
              <span>Ajouter un métier</span>
            </div>
          </ng-container>
        
          <ng-template #addfield_tpl>
              <label>Ajoutez des métiers</label>
              <options [options]="allJobs" [value]="selectedJobs" #jobOptions></options>
            <div class="form-input center-text">
              <button (click)="updateJobs(jobOptions.value!)" style="display:inline; width: 80%; padding: 5px;" class="button gradient"> Terminer </button>
            </div>
          </ng-template>
        </div>            

        <div class="form-input">
          <label>Site internet</label>
          <input class="form-element" type="text" formControlName="UserProfile.Company.webSite" />
        </div>

        <div class="form-input">
          <label>Chiffres d'affaires</label>
          <input class="form-element" type="text" formControlName="UserProfile.Company.capital" />
        </div>

        <div class="form-input">
          <label>Capital</label>
          <input class="form-element" type="text" formControlName="UserProfile.Company.revenue" />
        </div>

        <ng-container formGroupName="UserProfile.Company.admin">
          <fileinput [showtitle]="false" filename="Kbis" formControlName="Kbis">
            <file-svg name="Kbis" color="#156C9D" (click)="requestFile('admin', 'Kbis')" image></file-svg>
          </fileinput>

          <fileinput [showtitle]="false" filename="Attestation travail dissimulé" formControlName="Trav. Dis">
            <file-svg name="Trav. Dis" color="#054162" (click)="requestFile('admin', 'Trav. Dis')" image></file-svg>
          </fileinput>

          <fileinput [showtitle]="false" filename="Attestation RC + DC" formControlName="RC + DC">
            <file-svg name="RC + DC" color="#999999" (click)="requestFile('admin', 'RC + DC')" image></file-svg>
          </fileinput>

          <fileinput [showtitle]="false" filename="URSSAF" formControlName="URSSAF">
            <file-svg name="URSSAF" color="#F9C067" (click)="requestFile('admin', 'URSSAF')" image></file-svg>
          </fileinput>

          <fileinput [showtitle]="false" filename="Impôts" formControlName="Impôts">
            <file-svg name="Impôts" color="#52D1BD" (click)="requestFile('admin', 'Impôts')" image></file-svg>
          </fileinput>

          <fileinput [showtitle]="false" filename="Congés payés" formControlName="Congés Payés">
            <file-svg name="Congés Payés" color="#32A290" (click)="requestFile('admin', 'Congés payés')" image></file-svg>
          </fileinput>
        </ng-container>
      </form>
    </section>
  </ng-template>

  <ng-template #modifyPage3>
    <section class="full-width section">
      <form class="full-width form-control" [formGroup]="form">
        <h3 class="form-title font-Roboto">
          Certifications & labels:
        </h3>
        <div class="form-input">
          <label>Vos labels</label>
          <options [options]="allLabels" [value]="selectedLabels" (valueChange)="updateLabels($event)" #labelOptions></options>
        </div>
        <ng-container formArrayName="UserProfile.Company.LabelForCompany">
            <span class="position-relative" *ngFor="let control of companyLabelControls; index as i">
              <ng-container [formGroupName]="i">
                <fileinput [showtitle]="false" [filename]="control.get('label')!.value.name" formControlName="fileData">
                  <file-svg [name]="control.get('label')!.value.name" (click)="requestFile('labels', control.get('label')!.value.name)" image></file-svg>
                </fileinput>
              </ng-container>
            </span>
          </ng-container>
      </form>
    </section>
  </ng-template>

  <div class="mid-sticky-footer" style="margin-top: auto;">
    <div class="form-step">
      <div (click)="slider.index = 0" [class.active]="slider ? slider.index == 0 : true"></div>
      <div (click)="slider.index = 1" [class.active]="slider && slider.index == 1"></div>
      <div (click)="slider.index = 2" [class.active]="slider && slider.index == 2"></div>
    </div>
    <button class="button gradient full-width" (click)="onSubmit()"
      [disabled]="(!form.touched || form.invalid) || null">
      Enregistrer
    </button>
  </div>
  `,
  styles: [`
    @import 'src/styles/variables';
    @import 'src/styles/mixins';
    @import 'src/styles/responsive';


    :host {
      width: 100%;
      display: flex;
      flex-flow: column nowrap;
      flex-shrink: 0;
      padding-bottom: $mid-sticky-footer-height;
    }

    .form-title, .form-input label {
      font-size: 1em;
    }

    .metiers options {
      margin-bottom: 20px;
    }

    .number-name {
      display: block;
      white-space: pre;
      text-overflow: ellipsis;
      overflow: hidden;
      width: calc(100% - 90px);
    }

    .form-input .number-container {
      position: absolute;
      right: 0;
      top: 0;
    }

    .section {
      background-color: white;
      @extend %overflow-y;

      @include from($mobile) { background: transparent; }
    }

    .mid-sticky-footer {
      box-shadow: 0 -3px 3px 0 #ddd;
      background-color: white;
      @extend %sticky-footer;
      height: calc(#{$mid-sticky-footer-height} + env(safe-area-inset-bottom));
      padding: 10px 30px;
      @include with-set-safe-area(padding, bottom, 10px);
    }

    .metiers {
      & > .form-element {
        border-bottom: 2px solid #cdcfd0 !important; //otherwise it will focus all fields
      }

      .form-element:focus-within {
        border-bottom-color: #2980b9 !important;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModifyProfileForm {

  //swipe events
  @ViewChild(SlidesDirective) slider!: SlidesDirective;
  @HostListener('swipeleft')
  onSwipeLeft() { this.slider.left(); }
  
  @HostListener('swiperight')
  onSwipeRight() { this.slider.right(); }

  //outputs
  onSubmit() { this.submit.emit(this.form); }
  @Output() submit = new EventEmitter<FormGroup>();

  @Input() index: number = 0;
  @Input() animate: boolean = true;

  //get all labels and jobs
  @SnapshotAll('Label')
  allLabels!: Label[];

  @SnapshotAll('Job')
  allJobs!: Job[];

  //params that depend on the profile
  companyLabels!: LabelForCompany[];
  selectedLabels!: Label[];
  
  companyJobs!: JobForCompany[];
  selectedJobs!: Label[];

  companyFiles!: File[];

  @Input() profile!: Profile;
  @Input() user: any;


  constructor(private cd: ChangeDetectorRef, private store: Store, private popup: PopupService, private info: InfoService) {

  } 

  requestFile(type: 'admin' | 'labels', filename: string) {
  //   let target: Serialized<FilesRow> | undefined,
  //     content: FileUIOutput | undefined;
    
  //   if ( type == 'admin' ) {
  //     const field = this.form.controls['UserProfile.Company.admin'] as FormGroup,
  //       input = field.controls[filename];
      
  //     if ( input && (input.value as FileUIOutput).content )
  //       content = input.value;      
  //   } else {
  //     const field = this.form.controls['UserProfile.Company.LabelForCompany'] as FormArray,
  //       group = (field.controls as FormGroup[]).find(group => group.controls['label']?.value.name == filename);
      
  //     if ( group && (group.controls['fileData'].value as FileUIOutput).content )
  //       content = group.controls['fileData'].value;      
  //   }

  //   if ( !content )
  //     target = this.user.company.files.find(file => file.name == filename);
    
  //   if ( !content && !target ) {
  //     this.info.show('error', `Le fichier "${filename}" n'existe pas.`, 2000);
  //     return;
  //   }

  //   if ( !content ) {
  //     this.info.show('info', 'Téléchargement du fichier', Infinity);
  //     const req = this.store.dispatch(new DownloadFile(target!.id));
  //     req.pipe(take(1)).subscribe(() => {
  //       const file = FilesRow.getById(target!.id);
  //       this.popup.openFile(file);
  //       this.info.show('success', 'Fichier téléchargé', 2000);
  //     })
  //   } else {
  //     this.popup.openFile(content);
  //   }
  }

  form: FormGroup = new FormGroup({
    // User
    'UserProfile.lastName': new FormControl('', [
    
    ]),
    'UserProfile.firstName': new FormControl('', [
      
    ]),
    'UserProfile.userName': new FormControl('', [
      //Email()
    ]),
    'UserProfile.cellPhone': new FormControl('', [
      FieldType('phone')
    ]),
    'UserProfile.Company.JobForCompany': new FormArray([

    ]),
    //Company
    'UserProfile.Company.name': new FormControl('', [
    ]),
    'UserProfile.Company.siret': new FormControl('', [
      FieldType('number', ['un numéro de SIRET'])
    ]),
    'UserProfile.Company.capital': new FormControl('', [
      FieldType('number')
    ]),
    'UserProfile.Company.revenue': new FormControl('', [
      FieldType('number')
    ]),
    'UserProfile.Company.webSite': new FormControl('', [
      FieldType('url')
    ]),
    'UserProfile.Company.companyPhone': new FormControl('', [
      FieldType('phone')
    ]),
    'UserProfile.Company.LabelForCompany': new FormArray([

    ]),
    'UserProfile.Company.admin': new FormGroup({
      'Kbis': new FormControl(defaultFileUIOuput('admin')),
      'Trav. Dis': new FormControl(defaultFileUIOuput('admin')),
      'RC + DC': new FormControl(defaultFileUIOuput('admin')),
      'URSSAF': new FormControl(defaultFileUIOuput('admin')),
      'Impôts': new FormControl(defaultFileUIOuput('admin')),
      'Congés Payés': new FormControl(defaultFileUIOuput('admin'))
    })
  });

  get companyJobsControls() {
    return (this.form.controls['UserProfile.Company.JobForCompany'] as FormArray).controls;
  }

  get companyLabelControls() {
    return (this.form.controls['UserProfile.Company.LabelForCompany'] as FormArray).controls;
  }
  
  async ngOnInit() {
    let permissions  = await Camera.checkPermissions();
    if ( permissions.camera != 'granted' || permissions.photos != 'granted' )
      try {
        await Camera.requestPermissions({
          permissions: ["camera", "photos"]
        });
      } catch ( e ) {  }
    
  }

  ngOnChanges(changes: SimpleChanges) {
    if ( changes['profile'] )
      this.reload();
  }

  space(value: any, each: number = 2, by: number = 1) {
    return SpacingPipe.prototype.transform(value, each, by);
  }

  reload() {
    const { user, company} = this.profile as {user: User, company: Company};
    this.companyFiles = this.store.selectSnapshot(DataQueries.getMany('File', this.profile.company.files));
    this.companyLabels = this.store.selectSnapshot(DataQueries.getMany('LabelForCompany', this.profile.company.labels));
    this.companyJobs = this.store.selectSnapshot(DataQueries.getMany('JobForCompany', this.profile.company.jobs));

    const jobMapping = new Map(),
      labelMapping = new Map();

    this.selectedJobs = [];
    this.allJobs.forEach(job => {
      const used = this.companyJobs.find(jobForCompany => jobForCompany.job == job.id);
      if ( used ) {
        jobMapping.set(used.id, job);
        this.selectedJobs.push(job);
      }
    });

    this.selectedLabels = [];
    this.allLabels.forEach(label => {
      const used = this.companyLabels.find(labelForCompany => labelForCompany.label == label.id);
      if ( used ) {
        labelMapping.set(used.id, label);
        this.selectedLabels.push(label);
      }
    });

    const filesInput = this.form.controls['UserProfile.Company.admin'];
    this.companyFiles.forEach(({name}) => {
      filesInput.get(name)?.patchValue({name});
    });
    
    this.form.controls['UserProfile.lastName']?.setValue(user.lastName);
    this.form.controls['UserProfile.firstName']?.setValue(user.firstName);
    this.form.controls['UserProfile.userName']?.setValue(user.username);
    this.form.controls['UserProfile.cellPhone']?.setValue(this.space(user.cellPhone));
    this.form.controls['UserProfile.Company.name']?.setValue(company.name);
    this.form.controls['UserProfile.Company.siret']?.setValue(company.siret);
    this.form.controls['UserProfile.Company.revenue']?.setValue(company.revenue);
    this.form.controls['UserProfile.Company.capital']?.setValue(company.capital);
    this.form.controls['UserProfile.Company.webSite']?.setValue(company.webSite);
    this.form.controls['UserProfile.Company.companyPhone']?.setValue(this.space(company.companyPhone));
    
    const jobControl = this.form.controls['UserProfile.Company.JobForCompany'] as FormArray;
    jobControl.clear();
    for ( let jobForCompany of this.companyJobs ) {
      const jobObject = jobMapping.get(jobForCompany.id)!;
      jobControl.push(new FormGroup({
        job: new FormControl(jobObject),
        number: new FormControl(jobForCompany.number)
      }));
    }
    
    const labelControl = this.form.controls['UserProfile.Company.LabelForCompany'] as FormArray;
    labelControl.clear();
    for ( let labelForCompany of this.companyLabels ) {
      const labelObject = labelMapping.get(labelForCompany.id)!;
      labelControl.push(new FormGroup({
        label: new FormControl(labelObject),
        //get date from server
        fileData: new FormControl(defaultFileUIOuput(labelObject.name, labelForCompany.date, `Fichier "${labelObject.name}" pris en compte`))
      }));
    }

    // this.cd.markForCheck();
  }


  //make functions to help merge
  updateJobs(jobOptions: Option[]) {
    this.addingField = false;
    const
      oldJobs = this.selectedJobs,
      newJobs = jobOptions,
      oldJobsId = new Set(oldJobs.map(({id}) => id)),
      overlap = newJobs.filter(job => oldJobsId.has(job.id)),
      difference = newJobs.filter(job => !oldJobsId.has(job.id));
    
    let jobControl = this.form.controls['UserProfile.Company.JobForCompany'] as FormArray;
    jobControl.clear();

    for ( const item of difference )
      jobControl.push(new FormGroup({
        job: new FormControl(item),
        number: new FormControl(1)
      }))

    for ( const item of overlap ) {
      const target = this.companyJobs.find(jobForCompany => jobForCompany.job == item.id)!;
      jobControl.push(new FormGroup({
        job: new FormControl(item),
        number: new FormControl(target.number)
      }))
    }

    this.selectedJobs = jobOptions;
  };

  updateLabels(labelOptions: Option[]) {
    this.addingField = false;
    const newLabels = labelOptions;
    
    let labelControl = this.form.controls['UserProfile.Company.LabelForCompany'] as FormArray;
    for ( const item of newLabels ) {
      const target = this.companyLabels.find(labelForCompany => labelForCompany.label == item.id);
      labelControl.push(new FormGroup({
        label: new FormControl(item),
        fileData: new FormControl(defaultFileUIOuput(item.name, target?.date || '', `Fichier "${item.name}" pris en charge.`))
      }))
    }

    this.selectedLabels = labelOptions;
  }

  addingField: boolean = false;
};