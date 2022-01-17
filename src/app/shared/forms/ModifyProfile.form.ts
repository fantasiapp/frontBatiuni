import { ChangeDetectionStrategy, Component, HostListener, Input, ViewChild, EventEmitter, Output } from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { Serialized } from "src/common/types";
import { JobRow, LabelRow, UserProfileRow } from "src/models/data/data.model";
import { Option } from "src/models/option";
import { Email } from "src/validators/persist";
import { FileinputOutput } from "../components/filesUI/files.ui";
import { SlidesDirective } from "../directives/slides.directive";

@Component({
  selector: 'modify-profile-form',
  template: `
  <div [slides]="[modifyPage1, modifyPage2, modifyPage3]" [(index)]="index" type="template"
    [animate]="animate"></div>

  <ng-template #modifyPage1>
    <section class="full-width section">
      <form class="form-control" [formGroup]="modifyProfileForm">
        <h3 class="form-title font-Roboto">
          Infos personelles:
        </h3>
        <div class="form-input">
          <label>Nom du contact</label>
          <input class="form-element" type="text" formControlName="Userprofile.lastName" />
        </div>
        <div class="form-input">
          <label>Prénom du contact</label>
          <input class="form-element" type="text" formControlName="Userprofile.firstName" />
        </div>
        <div class="form-input">
          <label>Adresse e-mail contact</label>
          <input class="form-element" type="email" formControlName="Userprofile.userName" />
        </div>
        <div class="form-input">
          <label>Téléphone de l'entreprise</label>
          <input class="form-element" type="tel" formControlName="Userprofile.Company.companyPhone" />
        </div>
        <div class="form-input">
          <label>Téléphone portable</label>
          <input class="form-element" type="tel" formControlName="Userprofile.cellPhone" />
        </div>
      </form>
    </section>
  </ng-template>

  <ng-template #modifyPage2>
    <section class="full-width section">
      <form class="full-width form-control" [formGroup]="modifyProfileForm">
        <h3 class="form-title font-Roboto">
          Infos entreprise:
        </h3>
        <div class="form-input">
          <label>Nom de l'entreprise</label>
          <input class="form-element" type="text" formControlName="Userprofile.Company.name" />
        </div>
        <div class="form-input">
          <label>N SIRET</label>
          <input class="form-element" type="text" formControlName="Userprofile.Company.siret" />
        </div>
        <div class="form-input metiers">

          <ng-container *ngIf="!addingField; else addfield_tpl">
            <label>Métiers</label>
            <ng-container formArrayName="Userprofile.Company.JobForCompany">
              <span class="position-relative number" *ngFor="let control of profileJobsControls; index as i">
                <ng-container [formGroupName]="i">
                  <input class="form-element" type="text" [value]="control.get('job')!.value.name" disabled>
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
              <options [options]="allJobs" (valueChange)="updateJobs($event)"></options>
            <div class="form-input center-text">
              <button (click)="addingField = false" style="display:inline; width: 80%; padding: 5px;" class="button gradient"> Terminer</button>
            </div>
          </ng-template>
        </div>            

        <div class="form-input">
          <label>Site internet</label>
          <input class="form-element" type="text" formControlName="Userprofile.Company.webSite" />
        </div>

        <div class="form-input">
          <label>Chiffres d'affaires</label>
          <input class="form-element" type="text" formControlName="Userprofile.Company.capital" />
        </div>

        <fileinput [showtitle]="false" filename="Kbis" imgsrc="assets/files/KBIS.svg"></fileinput>
        <fileinput [showtitle]="false" filename="Attestation travail dissimulé"
          imgsrc="assets/files/Trav. Dis..svg"></fileinput>
        <fileinput [showtitle]="false" filename="Attestation RC + DC" imgsrc="assets/files/RC + DC.svg">
        </fileinput>
        <fileinput [showtitle]="false" filename="URSSAF" imgsrc="assets/files/urssaf.svg"></fileinput>
        <fileinput [showtitle]="false" filename="Impôts" imgsrc="assets/files/Impot.svg"></fileinput>
        <fileinput [showtitle]="false" filename="Congés payés" imgsrc="assets/files/Cong.Payés.svg"></fileinput>
      </form>
    </section>
  </ng-template>

  <ng-template #modifyPage3>
    <section class="full-width section">
      <form class="full-width form-control" [formGroup]="modifyProfileForm">
        <h3 class="form-title font-Roboto">
          Certifications & labels:
        </h3>
        <div class="form-input">
          <label>Vos labels</label>
          <options [options]="allLabels" (valueChange)="updateLabels($event)"></options>
        </div>
        <ng-container formArrayName="Userprofile.Company.LabelForCompany">
            <span class="position-relative" *ngFor="let control of companyLabelControls; index as i">
              <ng-container [formGroupName]="i">
                <fileinput [showtitle]="false" [filename]="control.get('label')!.value.name" formControlName="fileData"></fileinput>
              </ng-container>
            </span>
          </ng-container>
      </form>
    </section>
  </ng-template>

  <div style="margin-top: auto;">
    <div class="form-step">
      <div (click)="slider.index = 0" [class.active]="slider ? slider.index == 0 : true"></div>
      <div (click)="slider.index = 1" [class.active]="slider && slider.index == 1"></div>
      <div (click)="slider.index = 2" [class.active]="slider && slider.index == 2"></div>
    </div>
    <button class="button gradient full-width" (click)="onSubmit()"
      [disabled]="(!modifyProfileForm.touched || modifyProfileForm.invalid) || null">
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
    }

    .form-title, .form-input label {
      font-size: 1em;
    }

    .form-input .number-container {
      display: inline;
      right: $item-padding;
    }

    .section {
      background-color: white;
      @extend %overflow-y;

      @include from($mobile) { background: transparent; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModifyProfileForm {

  @Input()
  user!: Serialized<UserProfileRow>;

  @Input()
  index: number = 0;

  @ViewChild(SlidesDirective)
  slider!: SlidesDirective;

  @Input()
  animate: boolean = true;

  @Output()
  submit = new EventEmitter<FormGroup>();

  modifyProfileForm: FormGroup = new FormGroup({
    // User
    'Userprofile.lastName': new FormControl('', [
    ]),
    'Userprofile.firstName': new FormControl('', [
    ]),
    'Userprofile.userName': new FormControl('', [
      //Email()
    ]),
    'Userprofile.cellPhone': new FormControl('', [
    ]),
    'Userprofile.Company.JobForCompany': new FormArray([

    ]),
    //Company
    'Userprofile.Company.name': new FormControl('', [
    ]),
    'Userprofile.Company.siret': new FormControl('', [
    ]),
    'Userprofile.Company.capital': new FormControl('', [
    ]),
    'Userprofile.Company.webSite': new FormControl('', [
    ]),
    'Userprofile.Company.companyPhone': new FormControl('', [
      
    ]),
    'Userprofile.Company.LabelForCompany': new FormArray([

    ])
  });

  get profileJobsControls() {
    const jobsControl = this.modifyProfileForm.controls['Userprofile.Company.JobForCompany'] as FormArray;
    return jobsControl.controls;
  }

  get companyLabelControls() {
    const labelsControl = this.modifyProfileForm.controls['Userprofile.Company.LabelForCompany'] as FormArray;
    return labelsControl.controls;
  }

  @HostListener('swipeleft')
  onSwipeLeft() { this.slider.left(); }
  
  @HostListener('swiperight')
  onSwipeRight() { this.slider.right(); }

  onSubmit() {
    this.submit.emit(this.modifyProfileForm);
  }
  
  ngOnInit() {
    const companyLabels = this.user.company.labels.map(label => label.id),
      companyJobs = this.user.company.jobs.map(job => job.id);
    
    this.allLabels =[...LabelRow.instances.values()]
      .map(({name, id}) => ({id, name, checked: companyLabels.includes(id)}));
        
    this.allJobs = [...JobRow.instances.values()]
      .map(({name, id}) => ({id, name, checked: companyJobs.includes(id)}));

    this.modifyProfileForm.controls['Userprofile.lastName']?.setValue(this.user.lastName);
    this.modifyProfileForm.controls['Userprofile.firstName']?.setValue(this.user.firstName);
    this.modifyProfileForm.controls['Userprofile.userName']?.setValue(this.user.user);
    this.modifyProfileForm.controls['Userprofile.cellPhone']?.setValue(this.user.cellPhone);
    this.modifyProfileForm.controls['Userprofile.Company.name']?.setValue(this.user.company.name);
    this.modifyProfileForm.controls['Userprofile.Company.siret']?.setValue(this.user.company.siret);
    this.modifyProfileForm.controls['Userprofile.Company.capital']?.setValue(this.user.company.capital);
    this.modifyProfileForm.controls['Userprofile.Company.webSite']?.setValue(this.user.company.webSite);
    this.modifyProfileForm.controls['Userprofile.Company.companyPhone']?.setValue(this.user.company.companyPhone);

    const jobControl = this.modifyProfileForm.controls['Userprofile.Company.JobForCompany'] as FormArray;
    for ( let job of this.user.company.jobs )
      jobControl.push(new FormGroup({
        job: new FormControl(job.job),
        number: new FormControl(job.number)
      }));
    
    const labelControl = this.modifyProfileForm.controls['Userprofile.Company.LabelForCompany'] as FormArray,
      now = (new Date()).toISOString().slice(0, 10).replace(/-/g, '/');
    
    for ( let label of this.user.company.labels )
    labelControl.push(new FormGroup({
        label: new FormControl(label.label),
        //get date from server
        fileData: new FormControl({files: null, date: now} as FileinputOutput)
      }));
  }

  updateJobs(jobOptions: Option[]) {
    const jobsControl = this.modifyProfileForm.controls['Userprofile.Company.JobForCompany'] as FormArray,
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

    jobsControl.clear();
    [...countMap.entries()].forEach(([job, number]) => {
      const form = new FormGroup({
        job: new FormControl(job),
        number: new FormControl(number)
      });

      form.markAsDirty();
      jobsControl.push(form);
    });
  };

  updateLabels(labelOptions: Option[]) {
    const labelsControl = this.modifyProfileForm.controls['Userprofile.Company.LabelForCompany'] as FormArray,
      newLabels = labelOptions.map(label => LabelRow.getById(label.id)!),
      now = (new Date()).toISOString().slice(0, 10).replace(/-/g, '/');

    labelsControl.clear();
    newLabels.forEach((label) => {
      const form  = new FormGroup({
        label: new FormControl(label),
        fileData: new FormControl({files: null, date: now} as FileinputOutput)
      });
      form.markAsDirty();
      labelsControl.push(form);
    });
  }
  
  allLabels: Option[] = [];
  allJobs: Option[] = [];
  addingField: boolean = false;
  labels: Option[] = [];
};