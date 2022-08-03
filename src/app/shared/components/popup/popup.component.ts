import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, EventEmitter, HostListener, Injectable, Input, Sanitizer, SimpleChange, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { SafeResourceUrl } from "@angular/platform-browser";
import { Store } from "@ngxs/store";
import { combineLatest, Subject } from "rxjs";
import { distinct, map, switchMap, take, takeLast, takeUntil } from "rxjs/operators";
import { Dimension, DimensionMenu } from "src/app/shared/common/classes";
import { ContextUpdate, TemplateContext, ViewComponent, ViewTemplate } from "../../common/types";
import { FileDownloader } from "../../services/file-downloader.service";
import { BasicFile, FileUI } from "../filesUI/files.ui";
import { File, Company, Mission, DateG, PostDetailGraphic, Task, Ref, DatePost, PostDateAvailableTask, PostDetail, User, Post } from "src/models/new/data.interfaces";
import { DataQueries, DataState } from "src/models/new/data.state";
import { FileContext, FileViewer } from "../file-viewer/file-viewer.component";
import { SignContract, ModifyDetailedPost, CreateDetailedPost } from "src/models/new/user/user.actions";
import { SuiviPME } from "src/app/mobile/components/suivi_pme/suivi-pme.page";
import { assignDateType, SuiviChantierDateContentComponent } from "src/app/mobile/components/suivi_chantier_date-content/suivi_chantier_date-content.component";
import { UICheckboxComponent } from "../box/checkbox.component";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { SingleCache } from "../../services/SingleCache";
import { HomeComponent } from "src/app/mobile/components/home_page/home.component";
import { BoosterPage } from "src/app/mobile/components/booster/booster.page";
import { UIAnnonceResume } from "src/app/mobile/ui/annonce-resume/annonce-resume.ui";
import { ApplicationsComponent } from "src/app/mobile/components/applications/applications.component"
import { returnInputKeyboard } from '../../common/classes'
import { AbonnementPage } from "src/app/mobile/components/abonnement/abonnement.page";

const TRANSITION_DURATION = 200;

//extend to support components



// export interface assignDateType {
//   postDateAvailableTask: PostDateAvailableTask;
//   view: "ST" | "PME";
// }

@Component({
  selector: "popup",
  templateUrl: "./popup.component.html",
  styleUrls: ["./popup.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIPopup extends DimensionMenu {
  newTaskForm = new FormGroup({
    task: new FormControl("", [Validators.required]),
  });

  constructor(
    private cd: ChangeDetectorRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private popupService: PopupService,
    private store: Store
  ) {
    super();
  }

  @ViewChild("view", { read: ViewContainerRef, static: true })
  view!: ViewContainerRef;

  @ViewChild("delete", { read: TemplateRef, static: true })
  deletePost!: TemplateRef<any>;

  @ViewChild("sign", { read: TemplateRef, static: true })
  sign!: TemplateRef<any>;

  @ViewChild("setDate", { read: TemplateRef, static: true })
  setDate!: TemplateRef<any>;

  @ViewChild("closeMission", { read: TemplateRef, static: true })
  closeMission!: TemplateRef<any>;

  @ViewChild("validateCandidate", { read: TemplateRef, static: true })
  validateCandidate!: TemplateRef<any>;

  @ViewChild("refuseCandidate", { read: TemplateRef, static: true })
  refuseCandidate!: TemplateRef<any>;

  @ViewChild("blockCandidate", { read: TemplateRef, static: true })
  blockCandidate!: TemplateRef<any>;

  @ViewChild("boostPost", { read: TemplateRef, static: true })
  boostPost!: TemplateRef<any>;

  @ViewChild("onApply", { read: TemplateRef, static: true })
  onApply!: TemplateRef<any>;

  @ViewChild("onApplyConfirm", { read: TemplateRef, static: true })
  onApplyConfirm!: TemplateRef<any>;

  @ViewChild("newFile", { read: TemplateRef, static: true })
  newFile!: TemplateRef<any>;

  @ViewChild("deleteFile", { read: TemplateRef, static: true })
  deleteFile!: TemplateRef<any>;

  @ViewChild("deleteCandidate", { read: TemplateRef, static: true })
  deleteCandidate!: TemplateRef<any>;

  @ViewChild("missKbis", { read: TemplateRef, static: true })
  missKbis!: TemplateRef<any>;

  @ViewChild("missSubscription", { read: TemplateRef, static: true })
  missSubscription!: TemplateRef<any>;

  @ViewChild("signContractKbis", { read: TemplateRef, static: true })
  signContractKbis!: TemplateRef<any>;

  @ViewChild("successPayment", { read: TemplateRef, static: true })
  successPayment!: TemplateRef<any>;

  @ViewChild("cancelSubscription", { read: TemplateRef, static: true})
  cancelSubscription!: TemplateRef<any>;

  @Input()
  content?: Exclude<PopupView, ContextUpdate>;

  @Input()
  fromService: boolean = false;

  @Input()
  keepAlive: boolean = true;

  missionId?: Ref<Mission>;


  ngOnInit() {
    if (!this.fromService) return;

    this.popupService.popups$
      .pipe(takeUntil(this.destroy$))
      .subscribe((view) => {
        if (!view) return this.close();

        if (!this.view) return; //ignore
        this.view.clear();

        if (view.type == "predefined" || view.type == "template") {
          this.content = view;
          const template =
              view.type == "predefined" ? this[view.name] : view.template,
            context = view.context;

          this.view.createEmbeddedView(template, context);
        } else if (view.type == "component") {
          this.content = view;
          const factory = this.componentFactoryResolver.resolveComponentFactory(
              this.content.component
            ),
            componentRef = this.view.createComponent(factory);

          if (this.content.init) this.content.init(componentRef.instance);
        } else if (view.type == "context") {
          if (
            this.content?.type == "template" ||
            this.content?.type == "predefined"
          ) {
            const template =
              this.content.type == "predefined"
                ? this[this.content.name]
                : this.content.template;
            this.content.context = view.context;
            this.view.createEmbeddedView(template, this.content.context);
          }
        }
        this.open = true;
        this.cd.markForCheck();
      });

    this.popupService.dimension$
      .pipe(takeUntil(this.destroy$))
      .subscribe((dimension) => {
        this.dimension = dimension;
        this.cd.markForCheck();
      });
  }

  // ngAfterContentChecked(){
  //   this.cd.markForCheck()
  // }

  willClose = false;
  close() {
    this.willClose = true;
    setTimeout(() => {
      if (!this.keepAlive) this.view.clear();
      this.willClose = false;
      this.openChange.emit((this._open = false));
      if (this.content?.close) {
        this.content.close();
      }
      this.cd.markForCheck();
    }, TRANSITION_DURATION);
  }
  //extends destroy, no multiple inheritance :(
  protected destroy$ = new Subject<void>();
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  actionSign(missionId: number, view: "ST" | "PME") {
    //signe le contrat ici
    this.store
      .dispatch(new SignContract(missionId, view))
      .pipe(take(1))
      .subscribe(() => {});
  }

  detailedPostCheck(postDateAvailableTask: PostDateAvailableTask, detailedPost: PostDetail){
    const postDetails = postDateAvailableTask.postDetails.filter(postDetail => postDetail.id == detailedPost.id)
    return !!postDetails.length ? postDetails[0].checked : false
  }

  clearInput(newTaskForm: FormGroup){
    if(newTaskForm){
      let formControl = newTaskForm.get('task')!
      formControl.reset()
    }
  }


  modifyDetailedPostDate(detailDate: PostDetailGraphic, checkbox: UICheckboxComponent, assignDate: assignDateType, e: Event ) {
    // let unset = checkbox.value
    let datePostId: Ref<DatePost> = assignDate.datePostId
    
    this.store.dispatch(new ModifyDetailedPost(detailDate, detailDate.checked, datePostId)).pipe(take(1)).subscribe(result => {
      checkbox.onChange(e)
      detailDate.checked = !detailDate.checked
      const newDetailDate = detailDate
      newDetailDate.date = assignDate.date.date
      
      this.popupService.modifyPostDetail.next(newDetailDate)

      this.cd.markForCheck();
    }, error => {});
  }

  findTaskWithDate(date: DateG, task: PostDetailGraphic, missionId: Ref<Mission>, unset: boolean) {
    // essayer d'avoir un this.mission plutot que de l'appeler 20fois
    const mission = this.store.selectSnapshot(
      DataQueries.getById("Mission", missionId)
    );
    let taskWithId = task;
    // this.store
    //   .selectSnapshot(DataQueries.getMany("DetailedPost", mission!.details))
    //   .forEach((detail) => {
    //     if (
    //       unset &&
    //       detail.date == date.date?.date &&
    //       detail.content == task.content
    //     )
    //       taskWithId = detail as Task;
    //     else if (!unset && !detail.date && detail.content == task.content)
    //       taskWithId = detail as Task;
    //   })
    // taskWithId.date = date.date?.date!;
    // console.log("task", task)
    return taskWithId;
  }

  openWindow(url: string) {
    window.open(url);
  }

  openActionClose(context: any) {
    context.isActive = true;
    this.close();
  }
}

export type PredefinedPopups<T = any> = {
  readonly type: "predefined";
  name: "deletePost" | "sign" | "setDate" | "closeMission" | "validateCandidate" | "refuseCandidate" | "blockCandidate" | "boostPost" | "onApply" | "onApplyConfirm" | "newFile" | "deleteFile" | "deleteCandidate" | "missKbis" | "missSubscription" | "signContractKbis" | "successPayment" | "cancelSubscription"; // | 'closeMission'
  context?: TemplateContext;
};

export type PopupView = (
  | ViewTemplate
  | ViewComponent
  | ContextUpdate
  | PredefinedPopups
) & {
  close?: Function;
};

@Injectable({
  providedIn: "root",
})
export class PopupService {
  popups$ = new Subject<PopupView>();
  dimension$ = new Subject<Dimension>();
  modifyPostDetail = new Subject<PostDetailGraphic>();
  addPostDetail = new Subject<PostDetailGraphic>();
  defaultDimension: Dimension = {
    left: "20px",
    top: "30px",
    width: "calc(100% - 40px)",
    height: "calc(100% - 60px)",
  };

  constructor(private store: Store, private downloader: FileDownloader) {}

  show(view: PopupView, dimension?: Dimension) {
    this.popups$.next(view);
    this.dimension$.next({ ...this.defaultDimension, ...(dimension || {}) });
  }

  openFile(file: BasicFile | File, canOpenPDF: boolean = true) {
    console.log('Oopen File', file, canOpenPDF);
    if (!file.content) {
      let name: string = "File" + (file as File).id!.toString()
      if (SingleCache.checkValueInCache(name)) {
        this.openFile(SingleCache.getValueByName(name))
      }
      else {
      this.downloader
        .downloadFile((file as File).id!, true)
        .subscribe((file) => {
          SingleCache.setValueByName(name, file)
          this.openFile(file)
        })}
      return;
    }
    console.log('context pre');
    let context = this.downloader.createFileContext(file);
    console.log('context', context);
    this.popups$.next({
      type: "component",
      component: FileViewer,
      init: (viewer: FileViewer) => {
        viewer.fileContext = context;
        viewer.canOpenPDF = canOpenPDF;
      },
      close: () => {
        this.downloader.clearContext(context);
      },
    });

    this.dimension$.next(this.defaultDimension);
    return true;
  }

  openDeletePostDialog(source?: Subject<boolean>) {
    this.popups$.next({
      type: "predefined",
      name: "deletePost",
      context: { $implicit: source },
    });
    this.dimension$.next({
      width: "100%",
      height: "200px",
      top: "calc(50% - 100px)",
      left: "0",
    });
    return new EventEmitter();
  }

  openSignContractDialog(mission: Mission, onClosePopup: Function) {
    const view = this.store.selectSnapshot(DataState.view),
      closed$ = new Subject<void>();

    let fileContext: FileContext, previousFileContext: FileContext;
    let first: boolean = true;

    this.store
      .select(DataQueries.getById("Mission", mission.id))
      .pipe(
        switchMap((mission) => {
          return this.downloader.downloadFile(mission!.contract, false, true).pipe(
            map((file) => ({
              mission,
              file,
            }))
          );
        }),
        takeUntil(closed$)
      )
      .subscribe(({ mission, file }) => {
        fileContext = this.downloader.createFileContext(file);
        const context = {
          $implicit: {
            fileContext: fileContext,
            signedByProfile:
              (mission!.signedByCompany && view == "PME") ||
              (mission!.signedBySubContractor && view == "ST"),
            missionId: mission!.id,
            newTask: "",
            view: view,
          },
        };

        if (first) {
          this.dimension$.next(this.defaultDimension);
          this.popups$.next({
            type: "predefined",
            name: "sign",
            context,
            close: () => {
              this.downloader.clearContext(fileContext);
              closed$.next();
              onClosePopup();
            },
          });
          first = false;
        } else {
          if (previousFileContext)
            this.downloader.clearContext(previousFileContext);
          this.updateTemplate(context);
        }

        previousFileContext = fileContext;
      });
  }

  

  openCloseMission(company: Company, object: SuiviPME) {
    let first: boolean = true;
    const closed$ = new Subject<void>();

    const context = {
      $implicit: {
        name: company.name,
        isActive: false,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "closeMission",
        context,
        close: () => {
          if (context.$implicit.isActive) {
            object.openCloseMission();
          }
          closed$.next();
        },
      });

      first = false;
    }
  }

  validateCandidate(candidateId: number, post: Post, object: HomeComponent) {
    let candidate = this.store.selectSnapshot(DataQueries.getById('Candidate', candidateId))
    let companies = this.store.selectSnapshot(DataQueries.getAll('Company'))
    let candidateCompany = companies.filter(company => company.id == candidate?.company)
    let first: boolean = true;
    const closed$ = new Subject<void>();

    const context = {
      $implicit: {
        name: candidateCompany[0].name,
        isActive: false,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "validateCandidate",
        context,
        close: () => {
          if (context.$implicit.isActive) {
            object.validateCandidate(post, candidateId);
          }
          closed$.next();
        },
      });

      first = false;
    }
  }

  refuseCandidate(candidateId: number, post: Post, object: HomeComponent) {
    let candidate = this.store.selectSnapshot(DataQueries.getById('Candidate', candidateId))
    let companies = this.store.selectSnapshot(DataQueries.getAll('Company'))
    let candidateCompany = companies.filter(company => company.id == candidate?.company)
    let first: boolean = true;
    const closed$ = new Subject<void>();

    const context = {
      $implicit: {
        name: candidateCompany[0].name,
        isActive: false,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "refuseCandidate",
        context,
        close: () => {
          if (context.$implicit.isActive) {
            object.refuseCandidate(post, candidateId);
          }
          closed$.next();
        },
      });

      first = false;
    }
  }

  blockCandidate(candidateId: number, object: HomeComponent) {
    let candidate = this.store.selectSnapshot(DataQueries.getById('Candidate', candidateId))
    let companies = this.store.selectSnapshot(DataQueries.getAll('Company'))
    let candidateCompany = companies.filter(company => company.id == candidate?.company)
    let first: boolean = true;
    const closed$ = new Subject<void>();

    const context = {
      $implicit: {
        name: candidateCompany[0].name,
        isActive: false,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "blockCandidate",
        context,
        close: () => {
          if (context.$implicit.isActive) {
            object.blockCandidate(candidateId);
          }
          closed$.next();
        },
      });

      first = false;
    }
  }

  boostPost(post: Post, boostForm: any, object: BoosterPage) {

    let first: boolean = true;
    const closed$ = new Subject<void>();

    const context = {
      $implicit: {
        address: post.address,
        duration: boostForm.duration,
        isActive: false,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "boostPost",
        context,
        close: () => {
          if (context.$implicit.isActive) {
            object.boostPost();
          }
          closed$.next();
        },
      });

      first = false;
    }
  }

  onApply(post: Post, object: UIAnnonceResume) {

    let first: boolean = true;
    const closed$ = new Subject<void>();

    const context = {
      $implicit: {
        address: post.address.replace(/\d+/, "").trim(),
        name: post.contactName,
        startDate: post.startDate,
        endDate: post.endDate,
        isActive: false,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "onApply",
        context,
        close: () => {
          if (context.$implicit.isActive) {
            object.onApply();
          }
          closed$.next();
        },
      });

      first = false;
    }
  }

  onApplyConfirm(object: UIAnnonceResume) {

    let first: boolean = true;
    const closed$ = new Subject<void>();

    const context = {
      $implicit: {
        isActive: false,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "onApplyConfirm",
        context,
        close: () => {
          closed$.next();
        },
      });

      first = false;
    }
  }

  newFile(name: any, object: FileUI) {

    let first: boolean = true;
    const closed$ = new Subject<void>();

    const context = {
      $implicit: {
        name: name,
        isActive: false,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "newFile",
        context,
        close: () => {
          closed$.next();
        },
      });

      first = false;
    }
  }

  deleteFile(name: any, object: FileUI) {

    let first: boolean = true;
    const closed$ = new Subject<void>();

    const context = {
      $implicit: {
        name: name,
        isActive: false,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "deleteFile",
        context,
        close: () => {
          if (context.$implicit.isActive) {
            object.deleteFile();
          }
          closed$.next();
        },
      });

      first = false;
    }
  }

  deleteCandidate(post: Post, object: ApplicationsComponent) {

    let first: boolean = true;
    const closed$ = new Subject<void>();

    const context = {
      $implicit: {
        address: post.address.replace(/\d+/, "").trim(),
        name: post.contactName,
        isActive: false,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "deleteCandidate",
        context,
        close: () => {
          if (context.$implicit.isActive) {
            object.deleteCandidate(post.id);
          }
          closed$.next();
        },
      });

      first = false;
    }
  }

  missKbis(phrase: string) {

    let first: boolean = true;
    const closed$ = new Subject<void>();

    const context = {
      $implicit: {
        phrase: phrase,
        isActive: false,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "missKbis",
        context,
        close: () => {
          closed$.next();
        },
      });

      first = false;
    }
  }

  missSubscription(phrase: string) {

    let first: boolean = true;
    const closed$ = new Subject<void>();

    const context = {
      $implicit: {
        phrase: phrase,
        isActive: false,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "missSubscription",
        context,
        close: () => {
          closed$.next();
        },
      });

      first = false;
    }
  }

  signContractKbis(mission: Mission, onClosePopup: Function) {
    let first: boolean = true;
    const closed$ = new Subject<void>();

    const context = {
      $implicit: {
        isActive: false,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "signContractKbis",
        context,
        close: () => {
          this.openSignContractDialog(mission, onClosePopup)
          closed$.next();
        },
      });

      first = false;
    }
  }

  successPayment() {

    let first: boolean = true;
    const closed$ = new Subject<void>();

    const context = {
      $implicit: {
        isActive: false,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "successPayment",
        context,
        close: () => {
          closed$.next();
        },
      });

      first = false;
    }
  }

  cancelSubscription(object: AbonnementPage) {
    let first: boolean = true;
    const closed$ = new Subject<void>();

    const context = {
      $implicit: {
        isActive: false,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "cancelSubscription",
        context,
        close: () => {
          console.log("close cancel popup")
          if (context.$implicit.isActive) {
            console.log("cancel")
            object.cancelSubscription()
          }
          closed$.next();
        },
      });

      first = false
    }
  }

  hide() {
    this.popups$.next(undefined);
  }

  updateTemplate(context: ViewTemplate["context"]) {
    this.popups$.next({ type: "context", context });
  }
}
