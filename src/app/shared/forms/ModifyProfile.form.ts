import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  ViewChild,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  SimpleChanges,
  HostBinding,
  ElementRef,
} from "@angular/core";
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { Camera } from "@capacitor/camera";
import { Option } from "src/models/option";
import { SlidesDirective } from "../directives/slides.directive";
import { defaultFileUIOuput, FileUI } from "../components/filesUI/files.ui";
import { FieldType, MatchField } from "src/validators/verify";
import { PopupService } from "../components/popup/popup.component";
import { InfoService } from "../components/info/info.component";
import { Store } from "@ngxs/store";
import {
  DataQueries,
  DataState,
  SnapshotAll,
  SnapshotArray,
} from "src/models/new/data.state";
import {
  Job,
  Label,
  File,
  Profile,
  User,
  Company,
  LabelForCompany,
  JobForCompany,
} from "src/models/new/data.interfaces";
import { SpacingPipe } from "../pipes/spacing.pipe";
import { DeleteFile, DeleteLabel, ModifyUserProfile } from "src/models/new/user/user.actions";
import { delay, getDirtyValues } from "../common/functions";
import { Email } from "src/validators/persist";
import { returnInputKeyboard } from '../common/classes'
import { JsonpClientBackend } from "@angular/common/http";
import { ActiveViewService } from "../services/activeView.service";
import { take } from "rxjs/operators";

@Component({
  selector: "modify-profile-form",
  template: `
    <ng-container
      [slides]="[modifyPage1, modifyPage2, modifyPage3]"
      [(index)]="index"
      type="template"
      [animate]="animate"
    ></ng-container>

    <ng-template #modifyPage1>
      <section class="full-width section">
        <form class="form-control section-host" [formGroup]="form">
          <div class="form-section">
            <h3 class="form-title">Infos personelles:</h3>
            <h4 class="champs">Champs obligatoire pour optimiser votre profil <span class='star'>*</span></h4>
            <div class="form-input">
              <label>Nom du contact</label>
              <input
                #input1
                (click)="onClickInputScroll(input1)"
                class="form-element"
                type="text"
                formControlName="UserProfile.lastName"
                (keyup)="returnInputKeyboard($event, input1)"
              />
            </div>
            <div class="form-input">
              <label>Pr??nom du contact</label>
              <input
                #input2
                (click)="onClickInputScroll(input2)"
                (keyup)="returnInputKeyboard($event, input2)"
                class="form-element"
                type="text"
                formControlName="UserProfile.firstName"
              />
            </div>
            <div class="form-input">
              <label>Fonction dans l'entreprise <span class='star'>*</span></label>
              <input
                #input6
                (click)="onClickInputScroll(input6)"
                (keyup)="returnInputKeyboard($event, input6)"
                class="form-element"
                type="text"
                formControlName="UserProfile.function"
              />
            </div>
            <div class="form-input">
              <label>Adresse e-mail contact</label>
              <input
                #input3
                (click)="onClickInputScroll(input3)"
                (keyup)="returnInputKeyboard($event, input3)"
                class="form-element"
                type="email"
                formControlName="UserProfile.userName"
              />
            </div>
            <div class="form-input">
              <label>T??l??phone portable <span class='star'>*</span></label>
              <input
                #input5
                (click)="onClickInputScroll(input5)"
                (keyup)="returnInputKeyboard($event, input5)"
                class="form-element"
                type="tel"
                formControlName="UserProfile.cellPhone"
              />
            </div>
            <div class="form-input">
              <label>T??l??phone de l'entreprise </label>
              <input
                #input4
                (click)="onClickInputScroll(input4)"
                (keyup)="returnInputKeyboard($event, input4)"
                class="form-element"
                type="tel"
                formControlName="UserProfile.Company.companyPhone"
              />
            </div>
          </div>
        </form>
      </section>
    </ng-template>

    <ng-template #modifyPage2>
      <section class="full-width section">
        <form class="full-width form-control section-host" [formGroup]="form">
          <div class="form-section">
            <h3 class="form-title">Infos entreprise:</h3>
            <h4 class="champs">Champs obligatoire pour optimiser votre profil <span class='star'>*</span> <span class='starGreen'>*</span></h4>
            <div class="form-input">
              <label>Nom de l'entreprise</label>
              <input
                #input7
                (click)="onClickInputScroll(input7)"
                (keyup)="returnInputKeyboard($event, input7)"
                class="form-element"
                type="text"
                formControlName="UserProfile.Company.name"
              />
            </div>
            <div class="form-input">
              <label>N SIRET</label>
              <input
                #input8
                (click)="onClickInputScroll(input8)"
                (keyup)="returnInputKeyboard($event, input8)"
                class="form-element"
                type="text"
                formControlName="UserProfile.Company.siret"
              />
            </div>
            <!-- change the structure -->
            <!-- all elements are selected -->
            <div class="form-input metiers">
              <ng-container *ngIf="!addingField; else addfield_tpl">
                <label>Activit??s <span class='star'>*</span></label>
                <ng-container formArrayName="UserProfile.Company.JobForCompany">
                  <span
                    class="number form-element"
                    *ngFor="let control of companyJobsControls; index as i"
                  >
                    <ng-container [formGroupName]="i">
                      <span class="number-name">{{
                        control.get("job")!.value.name
                      }}</span>
                    </ng-container>
                  </span>
                </ng-container>
                <div (click)="addingField = true" class="center-text add-field">
                  <img src="assets/icons/add.svg" />
                  <span>Ajouter un m??tier</span>
                </div>
              </ng-container>

              <ng-template #addfield_tpl>
                <label>Ajoutez des m??tiers</label>
                <options
                  [validateButton]='false'
                  [options]="allJobs"
                  [value]="selectedJobsForChecklist"
                  (valueChange)="updateSelectedJobs($event)"
                  #jobOptions
                ></options>
                <div class="form-input center-text">
                  <button
                    (click)="updateJobs(jobOptions.value!)"
                    style="display:inline; width: 80%; padding: 5px;"
                    class="button gradient"
                  >
                    Terminer
                  </button>
                </div>
              </ng-template>
            </div>

            <div class="form-input">
              <label>??tes-vous disponible pour des missions les samedis</label>
              <div class="flex row radio-container">
                <div class="radio-item">
                  <radiobox
                    class="grow"
                    [onselect]="false"
                    formControlName="UserProfile.Company.saturdayDisponibility"
                  ></radiobox>
                  <span>Non</span>
                </div>
                <div class="radio-item">
                  <radiobox
                    class="grow"
                    [onselect]="true"
                    formControlName="UserProfile.Company.saturdayDisponibility"
                  ></radiobox>
                  <span>Oui</span>
                </div>
              </div>
            </div>

            <div class="form-input">
              <label>Site internet</label>
              <input
                #input9
                (click)="onClickInputScroll(input9)"
                (keyup)="returnInputKeyboard($event, input9)"
                class="form-element"
                type="text"
                formControlName="UserProfile.Company.webSite"
              />
            </div>

            <div class="form-input">
              <label>Effectif de la boite <span class='star'>*</span></label>
              <input
                #input12
                (click)="onClickInputScroll(input12)"
                (keyup)="returnInputKeyboard($event, input12)"
                class="form-element"
                maxlength="11"
                formControlName="UserProfile.Company.size"
              />
            </div>

            <div class="form-input">
              <label>Chiffres d'affaires <span class='star'>*</span></label>
              <input
                #input10
                (click)="onClickInputScroll(input10)"
                (keyup)="returnInputKeyboard($event, input10)"
                class="form-element"
                maxlength="11"
                formControlName="UserProfile.Company.revenue"
              />
            </div>

            <div class="form-input">
              <label>Capital</label>
              <input
                #input11
                (click)="onClickInputScroll(input11)"
                (keyup)="returnInputKeyboard($event, input11)"
                class="form-element"
                maxlength="11"
                formControlName="UserProfile.Company.capital"
              />
            </div>


            <h3 class="form-title">Documents importants</h3>
            <h4 class="champs">Champs obligatoire pour optimiser votre profil <span class='starGreen'>*</span></h4>

            <ng-container formGroupName="UserProfile.Company.admin">
              
              <fileinput
                [showtitle]="false"
                filename="Kbis"
                name="Kbis"
                formControlName="Kbis"
                (kill)="removeDocument($event)"
              >
                <file-svg name="Kbis" color="#156C9D" image></file-svg>
              </fileinput>
              <fileinput 
              [showtitle]="false"
              name="Signature"
              filename="signature"
              formControlName='Signature'
              (kill)="removeDocument($event)"
              >
                <file-svg name="Signature" color="#e8c82a" image></file-svg>
              </fileinput>

              <fileinput
                [showtitle]="false"
                filename="Attestation travail dissimul??"
                name="Attestation travail dissimul??"
                formControlName="Trav Dis"
                (kill)="removeDocument($event)"
              >
                <file-svg name="Trav Dis" color="#054162" image></file-svg>
              </fileinput>

              <fileinput
                [showtitle]="false"
                name="Attestation RC + DC"
                filename="Attestation RC + DC"
                formControlName="RC + DC"
                (kill)="removeDocument($event)"
              >
                <file-svg name="RC + DC" color="#999999" image></file-svg>
              </fileinput>

              <fileinput
                [showtitle]="false"
                name="URSSAF"
                filename="URSSAF"
                formControlName="URSSAF"
                (kill)="removeDocument($event)"
              >
                <file-svg name="URSSAF" color="#F9C067" image></file-svg>
              </fileinput>

              <fileinput
                [showtitle]="false"
                name="Imp??ts"
                filename="Imp??ts"
                formControlName="Imp??ts"
                (kill)="removeDocument($event)"
              >
                <file-svg name="Imp??ts" color="#52D1BD" image></file-svg>
              </fileinput>

              <fileinput
                [showtitle]="false"
                name="Cong??s pay??s"
                filename="Cong??s pay??s"
                formControlName="Cong??s Pay??s"
                (kill)="removeDocument($event)"
              >
                <file-svg name="Cong??s Pay??s" color="#32A290" image></file-svg>
              </fileinput>
            </ng-container>
          </div>
        </form>
      </section>
    </ng-template>

    <ng-template #modifyPage3>
      <section class="full-width section">
        <form class="full-width form-control section-host" [formGroup]="form">
          <div class="form-section">
            <h3 class="form-title">Certifications & labels:</h3>
            <h4 class="champs">Champs obligatoire pour optimiser votre profil <span class='starGreen'>*</span></h4>
            <div class="form-input">
              <label>Vos labels <span class='starGreen'>*</span></label>
              <options
                [options]="allLabels"
                [value]="selectedLabels"
                (valueChange)="updateLabels($event)"
                #labelOptions
              ></options>
            </div>
            <ng-container formArrayName="UserProfile.Company.LabelForCompany">
              <span
                class="position-relative"
                *ngFor="let control of companyLabelControls; index as i"
              >
                <ng-container [formGroupName]="i">
                  <fileinput
                    [showtitle]="false"
                    [nature]="'labels'"
                    [filename]="control.get('label')!.value.fileName"
                    [name]="control.get('label')!.value.name"
                    formControlName="fileData"
                    (kill)="removeLabel($event)"
                  >
                    <file-svg
                      [name]="control.get('label')!.value.fileName"
                      [isLabel]="true"
                      image
                    ></file-svg>
                  </fileinput>
                </ng-container>
              </span>
            </ng-container>
          </div>
        </form>
      </section>
    </ng-template>

    <div class="mid-sticky-footer">
      <div class="form-step">
        <div
          (click)="slider.index = 0"
          [class.active]="slider ? slider.index == 0 : true"
        ></div>
        <div
          (click)="slider.index = 1"
          [class.active]="slider && slider.index == 1"
        ></div>
        <div
          (click)="slider.index = 2"
          [class.active]="slider && slider.index == 2"
        ></div>
      </div>
      <button
        class="button gradient full-width"
        (click)="onSubmit()"
        [disabled]="form.invalid || !formIsModified"
      >
        Enregistrer
      </button>
    </div>
  `,
  styles: [
    `
      @use "src/styles/variables" as *;
      @use "src/styles/mixins" as *;
      @use "src/styles/responsive" as *;
      @use "src/styles/forms" as *;

      :host {
        position: relative;
        width: 100%;
        display: flex;
        flex-flow: column nowrap;
        flex-shrink: 0;
      }

      .champs {
        font-size: small;
        color: #A2A2A2;
      }

      .star {
        color: #FFCA57;  
      }

      .starGreen {
        color: #B9EDAF;
      }

      section {
        position: relative;
        z-index: 5;
      }
      .mid-sticky-footer {
        z-index: 10;
      }
      .metiers options {
        margin-bottom: 20px;
      }

      .form-input span.number {
        display: flex;
        justify-content: space-between;
        padding-bottom: 0.5rem;
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
        flex: 1;
        background-color: white;
        @extend %overflow-y;
        @include from($mobile) {
          background: transparent;
        }
      }

      .mid-sticky-footer {
        box-shadow: 0 -3px 3px 0 #ddd;
        background-color: white;
        @extend %sticky-footer;
        height: calc(
          #{$mid-sticky-footer-height} + env(safe-area-inset-bottom)
        );
        padding: 10px 30px;
        @include with-set-safe-area(padding, bottom, 10px);
      }

      .metiers {
        & > .form-element {
          border-bottom: 2px solid #cdcfd0 !important;
        }

        .form-element:focus-within {
          border-bottom-color: #2980b9 !important;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModifyProfileForm {
  //swipe events
  @ViewChild(SlidesDirective) slider!: SlidesDirective;
  @HostListener("swipeleft")
  onSwipeLeft() {
    this.slider.left();
  }

  @HostListener("swiperight")
  onSwipeRight() {
    this.slider.right();
  }

  onClickInputScroll(input: HTMLElement){
    setTimeout(() => {
      input.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'})
      setTimeout(() => {
        input.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'})
      }, 500)
    }, 100)
  }

  //outputs
  onSubmit() {
    this.form.controls["UserProfile.Company.companyPhone"].setValue(this.form.controls["UserProfile.Company.companyPhone"].value.replace(/\s/g, ""));
    this.form.controls["UserProfile.cellPhone"].setValue(this.form.controls["UserProfile.cellPhone"].value.replace(/\s/g, ""));
    this.submit.emit(this.form);
  }
  @Output() submit = new EventEmitter<FormGroup>();

  @Input() index: number = 0;
  @Input() animate: boolean = true;

  //get all labels and jobs
  // @SnapshotAll("Label")
  allLabels!: Label[];

  @SnapshotAll("Job")
  allJobs!: Job[];

  //params that depend on the profile
  companyLabels!: LabelForCompany[];

  selectedLabels!: Label[];

  companyJobs!: JobForCompany[];
  selectedJobs!: Label[];
  get selectedJobsForChecklist() {
    return this.selectedJobs.map(job=> {return {id:job.id,name:job.name}})
  }
  initialSelectedJobs!: Label[];
  view = this.store.selectSnapshot(DataState.view)

  companyFiles!: File[];

  @Input() profile!: Profile;
  @Input() user: any;

  constructor(private store: Store, private ref: ElementRef, private popup: PopupService) {}

  form: FormGroup = new FormGroup({
    // User
    "UserProfile.lastName": new FormControl("", [Validators.required]),
    "UserProfile.firstName": new FormControl("", [Validators.required]),
    "UserProfile.userName": new FormControl("", [Validators.required,
      // Validators.required,
      // MatchField("email", "email", true)
      Email()
    ]),
    "UserProfile.cellPhone": new FormControl("", [FieldType("phone")]),
    "UserProfile.function": new FormControl("", []),
    "UserProfile.Company.JobForCompany": new FormArray([]),
    //Company
    "UserProfile.Company.name": new FormControl("", [Validators.required]),
    "UserProfile.Company.siret": new FormControl("", [
      FieldType("number", ["un num??ro de SIRET"])
    ]),
    "UserProfile.Company.capital": new FormControl("", [FieldType("number")]),
    "UserProfile.Company.revenue": new FormControl("", [FieldType("number")]),
    "UserProfile.Company.size": new FormControl("", [FieldType("positiveNumber")]),
    "UserProfile.Company.amount": new FormControl("", [FieldType("number")]),
    "UserProfile.Company.allQualifications": new FormControl("", []),
    "UserProfile.Company.saturdayDisponibility": new FormControl("", []),
    "UserProfile.Company.webSite": new FormControl("", [FieldType("url")]),
    "UserProfile.Company.companyPhone": new FormControl("", [FieldType("phone")]),
    "UserProfile.Company.LabelForCompany": new FormArray([]),
    "UserProfile.Company.admin": new FormGroup({
      "Kbis": new FormControl(defaultFileUIOuput("admin")),
      "Signature": new FormControl(defaultFileUIOuput("admin")),
      "Trav Dis": new FormControl(defaultFileUIOuput("admin")),
      "RC + DC": new FormControl(defaultFileUIOuput("admin")),
      "URSSAF": new FormControl(defaultFileUIOuput("admin")),
      "Imp??ts": new FormControl(defaultFileUIOuput("admin")),
      "Cong??s Pay??s": new FormControl(defaultFileUIOuput("admin")),
    }),
  });

  get companyJobsControls() {
    return (
      this.form.controls["UserProfile.Company.JobForCompany"] as FormArray
    ).controls;
  }

  get companyLabelControls() {
    return (
      this.form.controls["UserProfile.Company.LabelForCompany"] as FormArray
    ).controls;
  }

  get formIsModified() {
    return Object.keys(getDirtyValues(this.form)).length != 0
  }

  async ngOnInit() {
    let permissions = await Camera.checkPermissions();
    if (permissions.camera != "granted" || permissions.photos != "granted"){
      try {
        await Camera.requestPermissions({
          permissions: ["camera", "photos"],
        });
      } catch (e) {}
    }
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes["profile"]) this.reload();
  }
  
  space(value: any, each: number = 2, by: number = 1) {
    return SpacingPipe.prototype.transform(value, each, by);
  }
  
  reload() {
    this.allLabels = this.store.selectSnapshot(DataQueries.getAll('Label'))
    const { user, company } = this.profile as { user: User; company: Company };
    this.companyFiles = this.store.selectSnapshot(DataQueries.getMany("File", this.profile.company.files));
    this.companyLabels = this.store.selectSnapshot(DataQueries.getMany("LabelForCompany", this.profile.company.labels));
    this.companyJobs = this.store.selectSnapshot(DataQueries.getMany("JobForCompany", this.profile.company.jobs));

    const jobMapping = new Map(),
      labelMapping = new Map();

    this.selectedJobs = [];
    this.allJobs.forEach((job) => {
      const used = this.companyJobs.find(
        (jobForCompany) => jobForCompany.job == job.id
      );
      if (used) {
        jobMapping.set(used.id, job);
        this.selectedJobs.push({
          id: job.id,
          name: job.name,
          fileName: ''} as Label
          );
      }
    });
    this.initialSelectedJobs = this.selectedJobs;

    this.selectedLabels = [];
    if(this.allLabels){
      this.allLabels.forEach((label) => {
        const used = this.companyLabels.find(
          (labelForCompany) => {
            return labelForCompany.label == label.id
          }
        );
        if (used) {
          labelMapping.set(used.id, label);
          this.selectedLabels.push(label);
        }
      });
    }

    const filesInput = this.form.controls["UserProfile.Company.admin"];
    if (filesInput){
      this.companyFiles.forEach((file) => {
        console.log("je te parle", file)
        filesInput.get(file.name)?.patchValue(file);
      });
    }

    this.form.controls["UserProfile.lastName"]?.setValue(user.lastName);
    this.form.controls["UserProfile.firstName"]?.setValue(user.firstName);
    this.form.controls["UserProfile.userName"]?.setValue(user.username);
    this.form.controls["UserProfile.cellPhone"]?.setValue(
      this.space(user.cellPhone)
    );
    this.form.controls["UserProfile.function"]?.setValue(user.function);
    this.form.controls["UserProfile.Company.name"]?.setValue(company.name);
    this.form.controls["UserProfile.Company.siret"]?.setValue(company.siret);
    this.form.controls["UserProfile.Company.revenue"]?.setValue(
      company.revenue
    );
    this.form.controls["UserProfile.Company.size"]?.setValue(
      company.size
    );
    this.form.controls["UserProfile.Company.capital"]?.setValue(
      company.capital
    );
    this.form.controls["UserProfile.Company.amount"]?.setValue(company.amount);
    this.form.controls["UserProfile.Company.allQualifications"]?.setValue(
      company.allQualifications
    );
    this.form.controls["UserProfile.Company.saturdayDisponibility"]?.setValue(
      company.saturdayDisponibility
    );
    this.form.controls["UserProfile.Company.webSite"]?.setValue(
      company.webSite
    );
    this.form.controls["UserProfile.Company.companyPhone"]?.setValue(
      this.space(company.companyPhone)
    );

    const jobControl = this.form.controls["UserProfile.Company.JobForCompany"] as FormArray;
    jobControl.clear();
      for (let jobForCompany of this.companyJobs) {
      const jobObject = jobMapping.get(jobForCompany.id)!;
      jobControl.push(
        new FormGroup({
          job: new FormControl(jobObject),
          number: new FormControl(jobForCompany.number),
        })
      );
    }

    const labelControl = this.form.controls["UserProfile.Company.LabelForCompany"] as FormArray;
    labelControl.clear();

    for (let labelForCompany of this.companyLabels) {
      const labelObject = labelMapping.get(labelForCompany.id)!;
      labelControl.push(
        new FormGroup({
          label: new FormControl(labelObject),
          //get date from server

          fileData: new FormControl(
            defaultFileUIOuput(
              labelObject.name,
              labelForCompany.date,
              `Fichier "${labelObject.name}" pris en compte`
            )
          ),
        })
      );
    }
  }

  //make functions to help merge
  updateJobs(jobOptions: Option[]) {
    this.addingField = false;
    const oldJobs = this.initialSelectedJobs,
    newJobs = jobOptions,
    oldJobsId = new Set(oldJobs.map(({ id }) => id)),
    overlap = newJobs.filter((job) => oldJobsId.has(job.id)),
    difference = newJobs.filter((job) => !oldJobsId.has(job.id));
  
    let jobControl = this.form.controls["UserProfile.Company.JobForCompany"] as FormArray;
    jobControl.clear();

    for (const item of difference)
      jobControl.push(
        new FormGroup({
          job: new FormControl(item),
          number: new FormControl(1),
        })
      );

    for (const item of overlap) {
      const target = this.companyJobs.find(
        (jobForCompany) => jobForCompany.job == item.id
      )!;
      jobControl.push(
        new FormGroup({
          job: new FormControl(item),
          number: new FormControl(target.number),
        })
      );
    }

    this.selectedJobs = jobOptions.map(job => {
      return ({
      id: job.id,
      name: job.name,
      fileName: ''
    } as Label)
  });
    jobControl.markAsDirty();
  }

  //bad function
  //put the actual file if target is found
  //and mark this field as untouched
  updateLabels(labelOptions: Option[]) {
    this.addingField = false;
    const newLabels = labelOptions;
    const allCompanyLabels = this.companyFiles.filter(file => file.nature == "labels" )

    let labelControl = this.form.controls["UserProfile.Company.LabelForCompany"] as FormArray;
    labelControl.clear();
    for (const item of newLabels) {
      const target = this.companyLabels.find(
        (labelForCompany) => labelForCompany.label == item.id
      );
      labelControl.push(
        new FormGroup({
          label: new FormControl(item),
          fileData: new FormControl(
            defaultFileUIOuput(
              item.name,
              target?.date || "",
              `Veuillez t??l??charger un document.`
            ),
            [
              //formControl validator
              (control: AbstractControl): ValidationErrors | null => {
                return control.value.expirationDate ? null : {forbiddenVoidDate: {value: "Void"}} 
              }
            ]
          ),
        })
      );
    }

    for (let label of allCompanyLabels){
      if (!newLabels.some((newlabel) => newlabel.name == label.name)){
        this.removeLabel({filename: label.name})
      }
    }

    this.selectedJobs = labelOptions.map(job => {
      return ({
      id: job.id,
      name: job.name,
      fileName: ''
    } as Label)
  });
    labelControl.markAsDirty();
  }

  removeDocument(e :any) {
    const documents = this.form.controls[ "UserProfile.Company.admin"]
    let file = this.companyFiles.filter(file => file.name == e.filename)[0]
    if (file?.id){ this.store.dispatch(new DeleteFile(file?.id)).pipe(take(1)).subscribe(()=> {
      documents.get(e.filename)?.setValue({content: [""], expirationDate: '', ext: '???', name: 'Veuillez t??l??charger un document', nature: 'admin'})
      e.fileUI.value = {
        content: [""],
        expirationDate: "",
        ext: "???",
        name: "Veuillez t??l??charger un document",
        nature: e.fileUI.value.nature,
      }})}
    documents.get(e.filename)?.setValue({content: [""], expirationDate: '', ext: '???', name: 'Veuillez t??l??charger un document', nature: 'admin'})
    this.form.controls["UserProfile.Company.admin"].markAsDirty()
  } 

  removeLabel(e: any) {
    const allLabel = this.store.selectSnapshot(DataQueries.getAll("Label"))
    console.log('All LABEL', allLabel, e);
    let labelId = allLabel.filter((label) => label.fileName == e.filename)[0].id;
    let labelForCompanyId = this.companyLabels.filter((labelForCompany) => labelForCompany.label == labelId)[0].id
    const documents = this.form.controls[ "UserProfile.Company.LabelForCompany"] as FormArray;
    for (let i=0; i< documents.value.length; i++){
      if(documents.value[i].label.name == e.filename) {
        // documents.value[i].fileData = {content: [""], expirationDate: '', ext: '???', name: 'Veuillez t??l??charger un document', nature: e.filename}
        documents.removeAt(i)
      }
    }
    if (labelForCompanyId) {this.store.dispatch(new DeleteLabel(labelForCompanyId))}

    this.selectedLabels = this.selectedLabels.filter(label => label.name != e.filename)

    this.form.controls["UserProfile.Company.LabelForCompany"].markAsDirty();
  }

  addingField: boolean = false;

  returnInputKeyboard = returnInputKeyboard

  updateSelectedJobs(event: any){
    this.selectedJobs = event.map((e: any) => {
      return ({
        id: e.id,
      name: e.name,
      fileName: ''
    } as Label)
    })
  }
}
