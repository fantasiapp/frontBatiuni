import { ChangeDetectionStrategy, Component, HostListener, Input, ViewChild, EventEmitter, Output, HostBinding, SimpleChanges, ChangeDetectorRef } from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { Camera } from "@capacitor/camera";
import { Serialized } from "src/app/shared/common/types";
import { FilesRow, JobRow, LabelRow, UserProfileRow } from "src/models/data/data.model";
import { Option } from "src/models/option";
import { SlidesDirective } from "../directives/slides.directive";
import { defaultFileUIOuput, FileUIOutput } from "../components/filesUI/files.ui";
import { of } from "rxjs";
import { Store } from "@ngxs/store";
import { DownloadFile } from "src/models/user/user.actions";
import { DomSanitizer } from "@angular/platform-browser";
import { b64toBlob } from "../common/functions";
import { UserState } from "src/models/user/user.state";
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
      <form class="full-width form-control" [formGroup]="form">
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
        <!-- change the structure -->
        <!-- all elements are selected -->
        <div class="form-input metiers">
          <ng-container *ngIf="!addingField; else addfield_tpl">
            <label>Métiers</label>
            <ng-container formArrayName="Userprofile.Company.JobForCompany">
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
              <options [options]="allJobs" (valueChange)="updateJobs($event)"></options>
            <div class="form-input center-text">
              <button (click)="addingField = false" style="display:inline; width: 80%; padding: 5px;" class="button gradient"> Terminer </button>
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

        <div class="form-input">
          <label>Capital</label>
          <input class="form-element" type="text" formControlName="Userprofile.Company.revenue" />
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
      <form class="full-width form-control" [formGroup]="form">
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
                <fileinput [showtitle]="false" [filename]="control.get('label')!.value.name" formControlName="fileData">
                  <file-svg [name]="control.get('label')!.value.name" (click)="openFile(control.get('label')!.value.name)" image></file-svg>
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

  <popup [(open)]="fileView.open">
    <object class="cover-parent flex center" *ngIf="fileView.url" type="application/pdf" [data]="fileView.safeUrl">
      <div>
        Ne peut pas afficher le PDF dans l'application
        <div class="external-links" (click)="fileLoadError()">
          Ouvrir le PDF localement.
        </div>
      </div>
      
    </object>
  </popup>
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
      height: $mid-sticky-footer-height;
      padding: 10px 30px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModifyProfileForm {

  @Input() user!: Serialized<UserProfileRow>;
  @Input() index: number = 0;
  @Input() animate: boolean = true;
  @Output() submit = new EventEmitter<FormGroup>();
  @ViewChild(SlidesDirective) slider!: SlidesDirective;

  //make class
  fileView: any = {
    _open: false,
    get open() { return this._open; },
    set open(v) { if (!v) {this.url = null;} this._open = v; },
    url: null,
    safeUrl: null
  };

  openFile(filename: string) {
    const companyFiles = this.user.company.files,
      target = companyFiles.find(file => file.name == filename);
  
    if ( !target ) throw `file ${filename} doesn't exist on the current company`;
    const content = target.content ? of(target.content) : this.store.dispatch(new DownloadFile(target.id));
    
    content.subscribe(() => {
      const blob = b64toBlob(FilesRow.getById(target.id).content, 'application/pdf'),
        url = URL.createObjectURL(blob);
      
      this.fileView.url = url;
      this.fileView.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.fileView.open = true;
      this.cd.markForCheck();
    });
  }

  fileLoadError() {
    console.log(this.fileView.url, this.fileView.safeUrl);
    window.open(this.fileView.url);
  }

  form: FormGroup = new FormGroup({
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
    'Userprofile.Company.revenue': new FormControl('', [
    ]),
    'Userprofile.Company.webSite': new FormControl('', [
    ]),
    'Userprofile.Company.companyPhone': new FormControl('', [
      
    ]),
    'Userprofile.Company.LabelForCompany': new FormArray([

    ])
  });

  get profileJobsControls() {
    return (this.form.controls['Userprofile.Company.JobForCompany'] as FormArray).controls;
  }

  get companyLabelControls() {
    return (this.form.controls['Userprofile.Company.LabelForCompany'] as FormArray).controls;
  }

  @HostListener('swipeleft')
  onSwipeLeft() { this.slider.left(); }
  
  @HostListener('swiperight')
  onSwipeRight() { this.slider.right(); }

  onSubmit() { this.submit.emit(this.form); }

  constructor(private cd: ChangeDetectorRef, private store: Store, private sanitizer: DomSanitizer) {}
  
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
    const companyLabels = this.user.company.labels.map(label => label.label.id),
      companyJobs = this.user.company.jobs.map(job => job.job.id);
    
    this.allLabels =[...LabelRow.instances.values()]
      .map(({name, id}) => ({id, name, checked: companyLabels.includes(id)}));
        
    this.allJobs = [...JobRow.instances.values()]
      .map(({name, id}) => ({id, name, checked: companyJobs.includes(id)}));

    this.form.controls['Userprofile.lastName']?.setValue(this.user.lastName);
    this.form.controls['Userprofile.firstName']?.setValue(this.user.firstName);
    this.form.controls['Userprofile.userName']?.setValue(this.user.user);
    this.form.controls['Userprofile.cellPhone']?.setValue(this.user.cellPhone);
    this.form.controls['Userprofile.Company.name']?.setValue(this.user.company.name);
    this.form.controls['Userprofile.Company.siret']?.setValue(this.user.company.siret);
    this.form.controls['Userprofile.Company.revenue']?.setValue(this.user.company.revenue);
    this.form.controls['Userprofile.Company.capital']?.setValue(this.user.company.capital);
    this.form.controls['Userprofile.Company.webSite']?.setValue(this.user.company.webSite);
    this.form.controls['Userprofile.Company.companyPhone']?.setValue(this.user.company.companyPhone);

    const jobControl = this.form.controls['Userprofile.Company.JobForCompany'] as FormArray;
    jobControl.clear();
    for ( let job of this.user.company.jobs ) {
      jobControl.push(new FormGroup({
        job: new FormControl(job.job),
        number: new FormControl(job.number)
      }));
    }
    
    const labelControl = this.form.controls['Userprofile.Company.LabelForCompany'] as FormArray;
    
    labelControl.clear();
    for ( let label of this.user.company.labels ) {
      labelControl.push(new FormGroup({
        label: new FormControl(label.label),
        //get date from server
        fileData: new FormControl(defaultFileUIOuput(label.label.name, label.date))
      }));
    }

    this.cd.markForCheck();
  }


  //make functions to help merge
  updateJobs(jobOptions: Option[]) {
    const jobsControl = this.form.controls['Userprofile.Company.JobForCompany'] as FormArray,
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
      form.markAsTouched();
      jobsControl.push(form);
    });
    
    jobsControl.markAsTouched(); jobsControl.markAsDirty();
    this.form.markAsDirty();
    this.form.markAsTouched();
  };

  updateLabels(labelOptions: Option[]) {
    const labelsControl = this.form.controls['Userprofile.Company.LabelForCompany'] as FormArray,
      newLabels = labelOptions.map(label => LabelRow.getById(label.id)!) as LabelRow[];
    
    //also consider old labels
    labelsControl.clear();
    newLabels.forEach((label) => {
      const form  = new FormGroup({
        label: new FormControl(label),
        fileData: new FormControl(defaultFileUIOuput(label.name))
      });
      form.markAsDirty();
      form.markAsTouched();
      labelsControl.push(form);
    });

    labelsControl.markAsTouched(); labelsControl.markAsDirty();
    this.form.markAsDirty();
    this.form.markAsTouched();
  }
  
  allLabels: Option[] = [];
  allJobs: Option[] = [];
  addingField: boolean = false;
};