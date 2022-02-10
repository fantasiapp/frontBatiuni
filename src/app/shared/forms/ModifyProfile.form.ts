import { ChangeDetectionStrategy, Component, HostListener, Input, ViewChild, EventEmitter, Output, ChangeDetectorRef } from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { Camera } from "@capacitor/camera";
import { Serialized } from "src/app/shared/common/types";
import { FilesRow, JobRow, LabelRow, UserProfileRow } from "src/models/data/data.model";
import { Option } from "src/models/option";
import { SlidesDirective } from "../directives/slides.directive";
import { defaultFileUIOuput, FileUIOutput } from "../components/filesUI/files.ui";
import { Email } from "src/validators/persist";
import { FieldType } from "src/validators/verify";
import { of } from "rxjs";
import { PopupService } from "../components/popup/popup.component";
import { InfoService } from "../components/info/info.component";
import { DownloadFile } from "src/models/user/user.actions";
import { Store } from "@ngxs/store";
import { take } from "rxjs/operators";

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
              <span class="position-relative number form-element" *ngFor="let control of profileJobsControls; index as i">
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
              <options [options]="allJobs" [value]="companyJobs" (valueChange)="updateJobs($event)"></options>
            <div class="form-input center-text">
              <button (click)="addingField = false" style="display:inline; width: 80%; padding: 5px;" class="button gradient"> Terminer </button>
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
          <options [options]="allLabels" [value]="companyLabels" (valueChange)="updateLabels($event)"></options>
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModifyProfileForm {

  @Input() user!: Serialized<UserProfileRow>;
  @Input() index: number = 0;
  @Input() animate: boolean = true;
  @Output() submitted = new EventEmitter<FormGroup>();
  @ViewChild(SlidesDirective) slider!: SlidesDirective;

  constructor(private cd: ChangeDetectorRef, private store: Store, private popup: PopupService, private info: InfoService) {

  } 

  requestFile(type: 'admin' | 'labels', filename: string) {
    let target: Serialized<FilesRow> | undefined,
      content: FileUIOutput | undefined;
    
    if ( type == 'admin' ) {
      const field = this.form.controls['UserProfile.Company.admin'] as FormGroup,
        input = field.controls[filename];
      
      if ( input && (input.value as FileUIOutput).content )
        content = input.value;      
    } else {
      const field = this.form.controls['UserProfile.Company.LabelForCompany'] as FormArray,
        group = (field.controls as FormGroup[]).find(group => group.controls['label']?.value.name == filename);
      
      if ( group && (group.controls['fileData'].value as FileUIOutput).content )
        content = group.controls['fileData'].value;      
    }

    if ( !content )
      target = this.user.company.files.find(file => file.name == filename);
    
    if ( !content && !target ) {
      this.info.show('error', `Le fichier "${filename}" n'existe pas.`, 2000);
      return;
    }

    if ( !content ) {
      this.info.show('info', 'Téléchargement du fichier', Infinity);
      const req = this.store.dispatch(new DownloadFile(target!.id));
      req.pipe(take(1)).subscribe(() => {
        const file = FilesRow.getById(target!.id);
        this.popup.openFile(file);
        this.info.show('success', 'Fichier téléchargé', 2000);
      })
    } else {
      this.popup.openFile(content);
    }
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

  get profileJobsControls() {
    return (this.form.controls['UserProfile.Company.JobForCompany'] as FormArray).controls;
  }

  get companyLabelControls() {
    return (this.form.controls['UserProfile.Company.LabelForCompany'] as FormArray).controls;
  }

  @HostListener('swipeleft')
  onSwipeLeft() { this.slider.left(); }
  
  @HostListener('swiperight')
  onSwipeRight() { this.slider.right(); }

  onSubmit() { this.submitted.emit(this.form); }
  
  async ngOnInit() {
    let permissions  = await Camera.checkPermissions();
    if ( permissions.camera != 'granted' || permissions.photos != 'granted' )
      try {
        await Camera.requestPermissions({
          permissions: ["camera", "photos"]
        });
      } catch ( e ) {  }

    
    this.reloadData();
  }

  reloadData() {    
    this.companyLabels = this.user.company.labels.map(label => label.label);
    this.companyJobs = this.user.company.jobs.map(job => job.job);
    
    const filesInput = this.form.controls['UserProfile.Company.admin'];
    this.user.company.files.forEach(({name}) => {
      filesInput.get(name)?.patchValue({name});
    });
    
    this.form.controls['UserProfile.lastName']?.setValue(this.user.lastName);
    this.form.controls['UserProfile.firstName']?.setValue(this.user.firstName);
    this.form.controls['UserProfile.userName']?.setValue(this.user.user);
    this.form.controls['UserProfile.cellPhone']?.setValue(this.user.cellPhone);
    this.form.controls['UserProfile.Company.name']?.setValue(this.user.company.name);
    this.form.controls['UserProfile.Company.siret']?.setValue(this.user.company.siret);
    this.form.controls['UserProfile.Company.revenue']?.setValue(this.user.company.revenue);
    this.form.controls['UserProfile.Company.capital']?.setValue(this.user.company.capital);
    this.form.controls['UserProfile.Company.webSite']?.setValue(this.user.company.webSite);
    this.form.controls['UserProfile.Company.companyPhone']?.setValue(this.user.company.companyPhone);
    
    const jobControl = this.form.controls['UserProfile.Company.JobForCompany'] as FormArray;
    jobControl.clear();
    for ( let job of this.user.company.jobs ) {
      jobControl.push(new FormGroup({
        job: new FormControl(job.job),
        number: new FormControl(job.number)
      }));
    }
    
    const labelControl = this.form.controls['UserProfile.Company.LabelForCompany'] as FormArray;
    
    labelControl.clear();
    for ( let label of this.user.company.labels ) {
      console.log(label);
      labelControl.push(new FormGroup({
        label: new FormControl(label.label),
        //get date from server
        fileData: new FormControl(defaultFileUIOuput(label.label.name, label.date, 'Fichier pris en compte'))
      }));
    }

    this.cd.markForCheck();
  }


  //make functions to help merge
  updateJobs(jobOptions: Option[]) {
    const jobsControl = this.form.controls['UserProfile.Company.JobForCompany'] as FormArray,
      oldJobs = jobsControl.value as {job: JobRow, number: number}[],
      newJobs = jobOptions.map(option => JobRow.getById(option.id)!);

    const
      newEntries = newJobs.map(newJob => [newJob, 1] as [JobRow, number]),
      oldEntries = oldJobs
        .filter(oldJob => newJobs.includes(oldJob.job))
        .map(oldJob => [oldJob.job, oldJob.number] as [JobRow, number]);


    const countMap = new Map<JobRow, number>([
      ...newEntries,
      ...oldEntries
    ]);

    jobsControl.clear(); this.companyJobs.length = 0;
    [...countMap.entries()].forEach(([job, number]) => {
      this.companyJobs.push(job);
      const form = new FormGroup({
        job: new FormControl(job),
        number: new FormControl(number)
      });
      jobsControl.push(form);
    });
    
    jobsControl.markAsTouched(); jobsControl.markAsDirty();
    this.form.markAsDirty();
    this.form.markAsTouched();
  };

  updateLabels(labelOptions: Option[]) {
    const labelsControl = this.form.controls['UserProfile.Company.LabelForCompany'] as FormArray,
      newLabels = labelOptions.map(label => LabelRow.getById(label.id)!) as LabelRow[],
      companyLabels = this.user.company.labels;
    
    //also consider old labels
    labelsControl.clear(); this.companyLabels.length = 0;
    newLabels.forEach((label) => {
      const hasLabel = companyLabels.find(companyLabel => companyLabel.label.id == label.id),
        fileData = new FormControl(defaultFileUIOuput(label.name, hasLabel?.date, hasLabel ? 'Fichier pris en compte' : undefined)); 
      
      this.companyLabels.push(label);
      const form  = new FormGroup({
        label: new FormControl(label),
        fileData
      });
      labelsControl.push(form);
    });

    labelsControl.markAsTouched(); labelsControl.markAsDirty();
    this.form.markAsDirty();
    this.form.markAsTouched();
  }

  /* create utility for getting data around an admin file */
  
  allLabels = [...LabelRow.instances.values()];        
  allJobs = [...JobRow.instances.values()];;
  companyLabels: Option[] = [];
  companyJobs: Option[] = [];

  addingField: boolean = false;
};