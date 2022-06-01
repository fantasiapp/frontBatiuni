import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  HostListener,
  Injectable,
  Input,
  Sanitizer,
  SimpleChange,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { SafeResourceUrl } from "@angular/platform-browser";
import { Store } from "@ngxs/store";
import { combineLatest, Subject } from "rxjs";
import {
  distinct,
  map,
  switchMap,
  take,
  takeLast,
  takeUntil,
} from "rxjs/operators";
import { Dimension, DimensionMenu } from "src/app/shared/common/classes";
import {
  ContextUpdate,
  TemplateContext,
  ViewComponent,
  ViewTemplate,
} from "../../common/types";
import { FileDownloader } from "../../services/file-downloader.service";
import { BasicFile } from "../filesUI/files.ui";
import {
  File,
  Company,
  Mission,
  DateG,
  PostDetailGraphic,
  Task,
  Ref,
  DatePost,
  PostDateAvailableTask,
  PostDetail,
} from "src/models/new/data.interfaces";
import { DataQueries, DataState } from "src/models/new/data.state";
import { FileContext, FileViewer } from "../file-viewer/file-viewer.component";
import {
  SignContract,
  ModifyDetailedPost,
  CreateDetailedPost,
} from "src/models/new/user/user.actions";
import { SuiviPME } from "src/app/mobile/components/suivi_pme/suivi-pme.page";
import { SuiviChantierDateContentComponent } from "src/app/mobile/components/suivi_chantier_date-content/suivi_chantier_date-content.component";
import { UICheckboxComponent } from "../box/checkbox.component";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { SingleCache } from "../../services/SingleCache";

const TRANSITION_DURATION = 200;

//extend to support components

export interface assignDateType {
  missionId: Ref<Mission>;
  date: PostDateAvailableTask;
  datePostId: Ref<DatePost>;
  view: "ST" | "PME";
}

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
    console.log('checked', !!postDetails.length ? postDetails[0].checked : false);
    return !!postDetails.length ? postDetails[0].checked : false
  }

  addNewTask(e: Event,assignDate: assignDateType, input: HTMLInputElement) {
    // this.store.dispatch(new CreateDetailedPost(assignDate.postDateAvailableTask, input.value, assignDate!.date!.date!.date))

    // console.log('addNewTask', missionId, input.value, date);
    console.log('object');
    console.log('assing', assignDate);
    this.store.dispatch(new CreateDetailedPost(assignDate.missionId, input.value, assignDate.datePostId)).pipe(take(1)).subscribe(() => {
      input.value = "";
      
      console.log('assing', assignDate);
      const mission = this.store.selectSnapshot(DataQueries.getById("Mission", assignDate.missionId))
      const missionPostDetail = this.store.selectSnapshot(DataQueries.getMany("DetailedPost", mission!.details)) as Task[];
      console.log('assing', assignDate);
      const newTask = missionPostDetail[missionPostDetail.length - 1];
      console.log('NewTask,', newTask);
      
      // assignDate.date.allPostDetails = this.store.selectSnapshot(DataQueries.getMany("DetailedPost", mission!.details));
      // this.popupService.addPostDetailList.next(newTask);
      const newTaskSupervision = this.store.selectSnapshot(DataQueries.getMany("Supervision", newTask.supervisions))
      const detailDate: PostDetailGraphic = {
        id: newTask.id,
        date: assignDate.date.date,
        content: newTask.content,
        validated: newTask.validated,
        refused: newTask.refused,
        supervisions: newTaskSupervision,
        checked: true
      }
      assignDate.date.allPostDetails.push(detailDate)
      console.log('detailDAte,', detailDate);
      assignDate.date.postDetails.push(detailDate)
      this.popupService.modifyPostDetailList.next(detailDate)

      this.cd.markForCheck();
    });
  }


  modifyDetailedPostDate(detailDate: PostDetailGraphic, checkbox: UICheckboxComponent, assignDate: assignDateType ) {
    // let unset = checkbox.value
    let datePostId: Ref<DatePost> = assignDate.datePostId
    
    this.store.dispatch(new ModifyDetailedPost(detailDate, detailDate.checked, datePostId)).pipe(take(1)).subscribe(() => {
      console.log('detailDate', detailDate);
      detailDate.checked = !detailDate.checked
      const newDetailDate = detailDate
      newDetailDate.date = assignDate.date.date
      console.log('newDetailDate', newDetailDate);
      
      this.popupService.modifyPostDetailList.next(newDetailDate)

      this.cd.markForCheck();
    });
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
  name: "deletePost" | "sign" | "setDate" | "closeMission"; // | 'closeMission'
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
  modifyPostDetailList = new Subject<PostDetailGraphic>();
  addPostDetailList = new Subject<PostDetail>();
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

  openFile(file: BasicFile | File) {
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

    let context = this.downloader.createFileContext(file);
    this.popups$.next({
      type: "component",
      component: FileViewer,
      init: (viewer: FileViewer) => {
        viewer.fileContextList = [context];
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

  openSignContractDialog(mission: Mission) {
    const view = this.store.selectSnapshot(DataState.view),
      closed$ = new Subject<void>();

    let fileContext: FileContext, previousFileContext: FileContext;
    let first: boolean = true;

    this.store
      .select(DataQueries.getById("Mission", mission.id))
      .pipe(
        switchMap((mission) => {
          return this.downloader.downloadFile(mission!.contract).pipe(
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

  openDateDialog(
    missionId: Ref<Mission>,
    date: PostDateAvailableTask,
    datePostId: Ref<DatePost>,
    objectSuivi: SuiviChantierDateContentComponent
  ) {
    const view = this.store.selectSnapshot(DataState.view),
      closed$ = new Subject<void>();
    let first: boolean = true;

    const context = {
      $implicit: {
        missionId: missionId,
        date: date,
        datePostId: datePostId,
        view: view,
      },
    };

    if (first) {
      this.dimension$.next(this.defaultDimension);
      this.popups$.next({
        type: "predefined",
        name: "setDate",
        context,
        close: (test: boolean) => {
          closed$.next();
          let content = document.getElementById("addTask") as HTMLInputElement;
          objectSuivi.updatePage(content);
        },
      });
      first = false;
    }
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

  hide() {
    this.popups$.next(undefined);
  }

  updateTemplate(context: ViewTemplate["context"]) {
    this.popups$.next({ type: "context", context });
  }
}
