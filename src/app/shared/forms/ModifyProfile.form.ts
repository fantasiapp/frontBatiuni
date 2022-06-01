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
} from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { Camera } from "@capacitor/camera";
import { Option } from "src/models/option";
import { SlidesDirective } from "../directives/slides.directive";
import { defaultFileUIOuput } from "../components/filesUI/files.ui";
import { FieldType } from "src/validators/verify";
import { PopupService } from "../components/popup/popup.component";
import { InfoService } from "../components/info/info.component";
import { Store } from "@ngxs/store";
import {
  DataQueries,
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
            <div class="form-input">
              <label>Nom du contact</label>
              <input
                class="form-element"
                type="text"
                formControlName="UserProfile.lastName"
              />
            </div>
            <div class="form-input">
              <label>Prénom du contact</label>
              <input
                class="form-element"
                type="text"
                formControlName="UserProfile.firstName"
              />
            </div>
            <div class="form-input">
              <label>Adresse e-mail contact</label>
              <input
                class="form-element"
                type="email"
                formControlName="UserProfile.userName"
              />
            </div>
            <div class="form-input">
              <label>Téléphone de l'entreprise</label>
              <input
                class="form-element"
                type="tel"
                formControlName="UserProfile.Company.companyPhone"
              />
            </div>
            <div class="form-input">
              <label>Téléphone portable</label>
              <input
                class="form-element"
                type="tel"
                formControlName="UserProfile.cellPhone"
              />
            </div>
            <div class="form-input">
              <label>Fonction dans l'entreprise</label>
              <input
                class="form-element"
                type="text"
                formControlName="UserProfile.function"
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
            <div class="form-input">
              <label>Nom de l'entreprise</label>
              <input
                class="form-element"
                type="text"
                formControlName="UserProfile.Company.name"
              />
            </div>
            <div class="form-input">
              <label>N SIRET</label>
              <input
                class="form-element"
                type="text"
                formControlName="UserProfile.Company.siret"
              />
            </div>
            <!-- change the structure -->
            <!-- all elements are selected -->
            <div class="form-input metiers">
              <ng-container *ngIf="!addingField; else addfield_tpl">
                <label>Métiers</label>
                <ng-container formArrayName="UserProfile.Company.JobForCompany">
                  <span
                    class="number form-element"
                    *ngFor="let control of companyJobsControls; index as i"
                  >
                    <ng-container [formGroupName]="i">
                      <span class="number-name">{{
                        control.get("job")!.value.name
                      }}</span>
                      <div class="position-absolute number-container">
                        <number formControlName="number"></number>
                      </div>
                    </ng-container>
                  </span>
                </ng-container>
                <div (click)="addingField = true" class="center-text add-field">
                  <img src="assets/icons/add.svg" />
                  <span>Ajouter un métier</span>
                </div>
              </ng-container>

              <ng-template #addfield_tpl>
                <label>Ajoutez des métiers</label>
                <options
                  [options]="allJobs"
                  [value]="selectedJobs"
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
              <label>Êtes vous une entreprise TCE</label>
              <div class="flex row radio-container">
                <div class="radio-item">
                  <radiobox
                    class="grow"
                    [onselect]="false"
                    formControlName="UserProfile.Company.allQualifications"
                  ></radiobox>
                  <span>Non</span>
                </div>
                <div class="radio-item">
                  <radiobox
                    class="grow"
                    [onselect]="true"
                    formControlName="UserProfile.Company.allQualifications"
                  ></radiobox>
                  <span>Oui</span>
                </div>
              </div>
            </div>

            <div class="form-input">
              <label>Êtes-vous disponible pour des missions les samedis</label>
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
                class="form-element"
                type="text"
                formControlName="UserProfile.Company.webSite"
              />
            </div>

            <div class="form-input">
              <label>Chiffres d'affaires</label>
              <input
                class="form-element"
                type="text"
                maxlength="11"
                formControlName="UserProfile.Company.revenue"
              />
            </div>

            <div class="form-input">
              <label>Capital</label>
              <input
                class="form-element"
                type="text"
                maxlength="11"
                formControlName="UserProfile.Company.capital"
              />
            </div>

            <div class="form-input">
              <label>Taux horaire moyen</label>
              <input
                class="form-element"
                type="text"
                formControlName="UserProfile.Company.amount"
              />
            </div>

            <ng-container formGroupName="UserProfile.Company.admin">
              
              <fileinput
                [showtitle]="false"
                filename="Kbis"
                formControlName="Kbis"
              >
                <file-svg name="Kbis" color="#156C9D" image></file-svg>
              </fileinput>

              <fileinput
                [showtitle]="false"
                filename="Attestation travail dissimulé"
                formControlName="Trav Dis"
              >
                <file-svg name="Trav Dis" color="#054162" image></file-svg>
              </fileinput>

              <fileinput
                [showtitle]="false"
                filename="Attestation RC + DC"
                formControlName="RC + DC"
              >
                <file-svg name="RC + DC" color="#999999" image></file-svg>
              </fileinput>

              <fileinput
                [showtitle]="false"
                filename="URSSAF"
                formControlName="URSSAF"
              >
                <file-svg name="URSSAF" color="#F9C067" image></file-svg>
              </fileinput>

              <fileinput
                [showtitle]="false"
                filename="Impôts"
                formControlName="Impôts"
              >
                <file-svg name="Impôts" color="#52D1BD" image></file-svg>
              </fileinput>

              <fileinput
                [showtitle]="false"
                filename="Congés payés"
                formControlName="Congés Payés"
              >
                <file-svg name="Congés Payés" color="#32A290" image></file-svg>
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
            <div class="form-input">
              <label>Vos labels</label>
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
                    [filename]="control.get('label')!.value.name"
                    formControlName="fileData"
                  >
                    <file-svg
                      [name]="control.get('label')!.value.name"
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
        [disabled]="form.invalid || null"
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

  //outputs
  onSubmit() {
    this.form.controls["UserProfile.Company.companyPhone"].setValue(this.form.controls["UserProfile.Company.companyPhone"].value.replace(/\s/g, ""));
    this.form.controls["UserProfile.cellPhone"].setValue(this.form.controls["UserProfile.cellPhone"].value.replace(/\s/g, ""));
    console.log(this.form.value);
    this.submit.emit(this.form);
  }
  @Output() submit = new EventEmitter<FormGroup>();

  @Input() index: number = 0;
  @Input() animate: boolean = true;

  //get all labels and jobs
  @SnapshotAll("Label")
  allLabels!: Label[];

  @SnapshotAll("Job")
  allJobs!: Job[];

  //params that depend on the profile
  companyLabels!: LabelForCompany[];

  selectedLabels!: Label[];

  companyJobs!: JobForCompany[];
  selectedJobs!: Label[];

  companyFiles!: File[];

  @Input() profile!: Profile;
  @Input() user: any;

  constructor(private store: Store) {}

  form: FormGroup = new FormGroup({
    // User
    "UserProfile.lastName": new FormControl("", []),
    "UserProfile.firstName": new FormControl("", []),
    "UserProfile.userName": new FormControl("", [
      //Email()
    ]),
    "UserProfile.cellPhone": new FormControl("", [FieldType("phone")]),
    "UserProfile.function": new FormControl("", []),
    "UserProfile.Company.JobForCompany": new FormArray([]),
    //Company
    "UserProfile.Company.name": new FormControl("", []),
    "UserProfile.Company.siret": new FormControl("", [
      FieldType("number", ["un numéro de SIRET"]),
    ]),
    "UserProfile.Company.capital": new FormControl("", [FieldType("number")]),
    "UserProfile.Company.revenue": new FormControl("", [FieldType("number")]),
    "UserProfile.Company.amount": new FormControl("", [FieldType("number")]),
    "UserProfile.Company.allQualifications": new FormControl("", []),
    "UserProfile.Company.saturdayDisponibility": new FormControl("", []),
    "UserProfile.Company.webSite": new FormControl("", [FieldType("url")]),
    "UserProfile.Company.companyPhone": new FormControl("", [
      FieldType("phone"),
    ]),
    "UserProfile.Company.LabelForCompany": new FormArray([]),
    "UserProfile.Company.admin": new FormGroup({
      Kbis: new FormControl(defaultFileUIOuput("admin")),
      "Trav Dis": new FormControl(defaultFileUIOuput("admin")),
      "RC + DC": new FormControl(defaultFileUIOuput("admin")),
      URSSAF: new FormControl(defaultFileUIOuput("admin")),
      Impôts: new FormControl(defaultFileUIOuput("admin")),
      "Congés Payés": new FormControl(defaultFileUIOuput("admin")),
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

  async ngOnInit() {
    let permissions = await Camera.checkPermissions();
    if (permissions.camera != "granted" || permissions.photos != "granted")
      try {
        await Camera.requestPermissions({
          permissions: ["camera", "photos"],
        });
      } catch (e) {}
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["profile"]) this.reload();
  }

  space(value: any, each: number = 2, by: number = 1) {
    return SpacingPipe.prototype.transform(value, each, by);
  }

  reload() {
    const { user, company } = this.profile as { user: User; company: Company };
    this.companyFiles = this.store.selectSnapshot(
      DataQueries.getMany("File", this.profile.company.files)
    );
    this.companyLabels = this.store.selectSnapshot(
      DataQueries.getMany("LabelForCompany", this.profile.company.labels)
    );
    this.companyJobs = this.store.selectSnapshot(
      DataQueries.getMany("JobForCompany", this.profile.company.jobs)
    );

    const jobMapping = new Map(),
      labelMapping = new Map();

    this.selectedJobs = [];
    this.allJobs.forEach((job) => {
      const used = this.companyJobs.find(
        (jobForCompany) => jobForCompany.job == job.id
      );
      if (used) {
        jobMapping.set(used.id, job);
        this.selectedJobs.push(job);
      }
    });

    this.selectedLabels = [];
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

    const filesInput = this.form.controls["UserProfile.Company.admin"];
    this.companyFiles.forEach(({ name }) => {
      filesInput.get(name)?.patchValue({ name });
    });

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

    const jobControl = this.form.controls[
      "UserProfile.Company.JobForCompany"
    ] as FormArray;
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

    const labelControl = this.form.controls[
      "UserProfile.Company.LabelForCompany"
    ] as FormArray;
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
    const oldJobs = this.selectedJobs,
      newJobs = jobOptions,
      oldJobsId = new Set(oldJobs.map(({ id }) => id)),
      overlap = newJobs.filter((job) => oldJobsId.has(job.id)),
      difference = newJobs.filter((job) => !oldJobsId.has(job.id));

    let jobControl = this.form.controls[
      "UserProfile.Company.JobForCompany"
    ] as FormArray;
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

    this.selectedJobs = jobOptions;
    jobControl.markAsDirty();
  }

  //bad function
  //put the actual file if target is found
  //and mark this field as untouched
  updateLabels(labelOptions: Option[]) {
    this.addingField = false;
    const newLabels = labelOptions;

    let labelControl = this.form.controls[
      "UserProfile.Company.LabelForCompany"
    ] as FormArray;
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
              `Veillez télécharger un document.`
            )
          ),
        })
      );
    }

    this.selectedLabels = labelOptions;
    labelControl.markAsDirty();
  }

  addingField: boolean = false;
}
