import { Injectable, NgZone } from "@angular/core";
import {
  Action,
  createSelector,
  Selector,
  State,
  StateContext,
  Store,
} from "@ngxs/store";
import { Observable, of, Subject } from "rxjs";
import { concatMap, map, tap } from "rxjs/operators";
import { HttpService } from "src/app/services/http.service";
import {
  GetGeneralData,
  HandleApplication,
  BlockCompany,
  SignContract,
  MarkViewed,
  ModifyAvailability,
  SetFavorite,
  TakePicture,
  InviteFriend,
  ValidateMissionDate,
  BoostPost,
  AskRecommandation,
  GiveRecommandation,
  GiveNotificationToken,
  ModifyFile,
  UnapplyPost,
  DeleteLabel,
  PostNotificationViewed,
} from "./user/user.actions";
import {
  ApplyPost,
  CandidateViewed,
  ChangePassword,
  ChangeProfilePicture,
  ChangeProfileType,
  DeleteFile,
  DeletePost,
  DownloadFile,
  DuplicatePost,
  GetUserData,
  ModifyUserProfile,
  CreateDetailedPost,
  ModifyDetailedPost,
  CreateSupervision,
  SwitchPostType,
  ModifyMissionDate,
  CloseMission,
  CloseMissionST,
  UploadFile,
  UploadPost,
  UploadImageSupervision,
  NotificationViewed,
} from "./user/user.actions";
import { Company, Interface, User } from "./data.interfaces";
import { DataReader, NameMapping, TranslatedName } from "./data.mapper";
import { Record, DataTypes } from "./data.interfaces";
import {
  addValues,
  compose,
  deleteIds,
  addSimpleChildren,
  transformField,
  addComplexChildren,
  replaceChildren,
  update,
} from "./state.operators";
import { Logout } from "../auth/auth.actions";
import { InfoService } from "src/app/shared/components/info/info.component";
import { GetCompanies } from "./search/search.actions";
import produce from "immer";
import { SlidemenuService } from "src/app/shared/components/slidemenu/slidemenu.component";
import { SwipeupService } from "src/app/shared/components/swipeup/swipeup.component";
import { transformAll } from "@angular/compiler/src/render3/r3_ast";
import { BooleanService } from "src/app/shared/services/boolean.service";
import { getUserDataService } from "src/app/shared/services/getUserData.service";
import { AppComponent } from "src/app/app.component";
import { SingleCache } from "src/app/shared/services/SingleCache";
import { NotifService } from "src/app/shared/services/notif.service";

export interface DataModel {
  fields: Record<string[]>;
  session: {
    currentUser: number;
    view: "ST" | "PME";
    time: number;
  };
  [key: string]: Record<any>;
}

export class Clear {
  static readonly type = "[Data] Clear";
  constructor(public data?: string) {}
}

@State<DataModel>({
  name: "d",
  defaults: {
    fields: {},
    session: {
      currentUser: -1,
      view: "ST",
      time: 8640000000000000,
    },
  },
})
@Injectable()
export class DataState {
  flagUpdate = true;
  isFirstTime = true
  constructor(
    private store: Store,
    private reader: DataReader,
    private http: HttpService,
    private info: InfoService,
    private slide: SlidemenuService,
    private swipeup: SwipeupService,
    private zone: NgZone,
    private booleanService: BooleanService,
    private getUserDataService: getUserDataService,
    private notifService: NotifService
  ) {}

  private pending$: Record<Subject<any>> = {};

  private registerPending<T>(key: string, pending: Subject<T>) {
    this.pending$[key] = pending;
    return key;
  }

  private getPending<T = any>(key: string): Subject<T> | undefined {
    return this.pending$[key];
  }

  private completePending<T = any>(key: string): void {
    const pending = this.getPending(key);
    if (pending) {
      pending.complete();
      delete this.pending$[key];
    }
  }

  private inZone(f: Function) {
    this.zone.run(() => f());
  }

  @Action(Clear)
  clear(ctx: StateContext<DataModel>, clear: Clear) {
    const current = ctx.getState();
    if (clear.data) {
      this.getUserDataService.emitDataChangeEvent()
      ctx.patchState({[clear.data]: {},fields: { ...current.fields, [clear.data]: [] },});
    }
    else {
      this.getUserDataService.emitDataChangeEvent()
      ctx.setState({fields: {},session: {currentUser: -1,view: "ST",time: 0,},});
    }
  }

  @Selector()
  static fields(state: DataModel) {
    return state.fields;
  }

  //try to avoid container state in the future
  @Selector()
  static currentUserId(state: DataModel) {
    return state.session.currentUser;
  }

  @Selector()
  static view(state: DataModel) {
    return state.session.view;
  }

  @Selector()
  static time(stage: DataModel) {
    return stage.session.time;
  }

  @Selector([DataState])
  static companies(state: DataModel) {
    return state["Company"] || {};
  }

  @Selector([DataState])
  static users(state: DataModel) {
    return state["UserProfile"] || {};
  }

  @Selector([DataState])
  static files(state: DataModel) {
    return state["File"] || {};
  }

  @Selector([DataState])
  static posts(state: DataModel) {
    return state["Post"] || {};
  }

  @Selector([DataState])
  static missions(state: DataModel) {
    return state["Mission"] || {};
  }

  static getType<K extends DataTypes>(type: K) {
    return createSelector([DataState], (state: DataModel) => {
      return state[type] || {};
    });
  }

  //------------------------------------------------------------------------
  @Action(GetGeneralData)
  getGeneralData(ctx: StateContext<DataModel>) {
    if(this.isFirstTime){
      console.log("getGeneralData")
      const req = this.http.get("initialize", {action: "getGeneralData",})

      return req.pipe(tap((response: any) => {
        const operations = this.reader.readStaticData(response);
        ctx.setState(compose(...operations));
      }))
    }
    else return
  }

  @Action(GetUserData)
  getUserData(ctx: StateContext<DataModel>, action: GetUserData) {
    const req = this.http.get("data", { action: action.action });
    if (this.isFirstTime) {
      this.booleanService.emitLoadingChangeEvent(true)
      this.booleanService.emitConnectedChangeEvent(true)
    }
    if (this.flagUpdate){
      this.flagUpdate = false
      return req.pipe(tap((response: any) => {
        console.log("getUserData response", response);
          this.getUserDataService.setNewResponse(response)
          if (this.isFirstTime) {
            this.getUserDataService.getDataChangeEmitter().subscribe((value) => {
              this.updateLocalData(ctx, value)
            })
            this.updateLocalData(ctx, response)
          }
          this.flagUpdate = true
    }, (error: any) => {
      this.flagUpdate = true
    })
      );
    }
    else{
      return
    }
  }

  updateLocalData(ctx: StateContext<DataModel>, response: any) {
    console.log('updateLocalData', response)
    if(this.booleanService.isConnected){
      console.log("update local data response", response)
      const loadOperations = this.reader.readInitialData(response),
      sessionOperation = this.reader.readCurrentSession(response);
      if (!this.isFirstTime) {
        let oldView = this.store.selectSnapshot(DataState.view)
          ctx.setState(compose(...loadOperations, sessionOperation));
          const state = ctx.getState();
          ctx.patchState({session: {...state.session,view: oldView,}})
        }
        else {
        ctx.setState(compose(...loadOperations, sessionOperation));
        this.isFirstTime = false
        }
        this.booleanService.emitLoadingChangeEvent(false)}
  }

  @Action(Logout)
  logout(ctx: StateContext<DataModel>) {
    console.log("logout")
    this.flagUpdate = true
    this.isFirstTime = true
    this.booleanService.emitConnectedChangeEvent(false)
    this.booleanService.emitLoadingChangeEvent(false)
    this.getUserDataService.resetTimestamp()
    ctx.setState({ fields: {}, session: { view: "ST", currentUser: -1 , time: 0} });
    ctx.dispatch(new GetGeneralData()); // a sign to decouple this from DataModel
  }

  @Action(ModifyUserProfile)
  modifyUser(ctx: StateContext<DataModel>, modify: ModifyUserProfile) {
    console.log("Modification qu'on envoie à JL", modify)
    const { labelFiles, adminFiles, onlyFiles, ...modifyAction } = modify;
    let companyLabels = this.store.selectSnapshot(DataQueries.getAll('File')).filter(file => file.nature == "labels")
    console.log("modify user profile", companyLabels, modifyAction)
    let req;
    if (onlyFiles) req = of({ [modify.action]: "OK" });
    else req = this.http.post("data", modifyAction);


    return req.pipe(
      tap((response: any) => {

        const rep = response
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        console.log("response ModifyUserData", rep)
        if (response[modify.action] !== "OK") {
          this.inZone(() => this.info.show("error", response.messages, 3000));
          throw response.messages;
        }
        delete response[modify.action];

        if(response.hasOwnProperty('JobForCompany') && Array.isArray(response['JobForCompany'])){
          for (let job of response.JobForCompany) {
            ctx.setState(addValues('JobForCompany', job))            
          }
        }


        if (response.hasOwnProperty('LabelForCompany') && Array.isArray(response['LabelForCompany'])){
          for (let label of response.LabelForCompany) {
            ctx.setState(addValues('LabelForCompany', label))
          }
        }

        // delete response['LabelForCompany']
        // delete response['JobForCompany']
        // ctx.setState(compose(...this.reader.readUpdates(response)));

        if (response.hasOwnProperty('Company')){
          ctx.setState(update('Company', response.Company))
        }
        if (response.hasOwnProperty('UserProfile')){
          ctx.setState(update('UserProfile', response.UserProfile))
        }

        this.inZone(() =>
          this.info.show("success", "Profil modifié avec succès", 2000)
        );
      }),
      concatMap(() => {
        this.getUserDataService.emitDataChangeEvent()
        labelFiles.forEach((file) =>
        // {
        // // if (companyLabels.some(label => label.name != file.nature)) {
        // //   console.log("file", file, "labelFile", labelFiles)
          ctx.dispatch(new UploadFile(file, "labels", file.nature, "Company"))
        // } else {

        //   ctx.dispatch(new ModifyFile(file, "labels", response.LabelForCompany.id, file.name, "Company"))
        // }}
        );
        Object.keys(adminFiles).forEach((name) => {
          if (adminFiles[name].id || adminFiles[name].id === 0) {
            console.log("modify file", adminFiles[name])
            ctx.dispatch(new ModifyFile(adminFiles[name], adminFiles[name].id, "Company"))
          } else if (adminFiles[name].ext != "???" ) {
            console.log("upload file", adminFiles[name])
            ctx.dispatch(new UploadFile(adminFiles[name], "admin", name, "Company"))
          }
        });
        return of(true);
      })
    );
  }



  @Action(ChangeProfilePicture)
  changeProfilePicture(ctx: StateContext<DataModel>, picture: ChangeProfilePicture) {
    console.log("change profile picture", picture)
    const profile = this.store.selectSnapshot(DataQueries.currentProfile),
      image = this.store.selectSnapshot(DataQueries.getProfileImage(profile.company.id)),
      req = this.http.post("data", picture);

    return req.pipe(
      tap((response: any) => {
        console.log("change profile picture response", response);
        if (response[picture.action] !== "OK") throw response["messages"];
        delete response[picture.action];
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(compose(addSimpleChildren("Company", profile.company.id, "File", response, "nature")));
      })
    );
  }

  @Action(UploadImageSupervision)
  uploadImageSupervision(ctx: StateContext<DataModel>, picture: UploadImageSupervision) {
    console.log("upload image supervision", picture)
    const profile = this.store.selectSnapshot(DataQueries.currentProfile),
      req = this.http.post("data", picture);

    return req.pipe(
      tap((response: any) => {
        console.log("upload image supervision response", response);
        if (response[picture.action] !== "OK") throw response["messages"];

        delete response[picture.action];
        let key = Object.keys(response)
        let id = response.supervisionId
        delete response.supervisionId;
        response[parseInt(key[0])].push(picture.imageBase64)
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        console.log("super ", response)
        ctx.setState(compose(addComplexChildren("Supervision", id, "File", response)))
      })
    );
  }

  @Action(ChangePassword)
  modifyPassword(ctx: StateContext<User>, action: ChangePassword) {
    console.log("change password", action)
    return this.http.post("data", action).pipe(
      tap((response: any) => {
        console.log("change password response", response);
        if (response[action.action] != "OK") throw response["messages"];
      })
    );
  }

  @Action(ChangeProfileType)
  changeProfileType(ctx: StateContext<DataModel>, action: ChangeProfileType) {
    console.log("change profile type", action)
    const state = ctx.getState();
    this.getUserDataService.emitDataChangeEvent()
    return ctx.patchState({session: {...state.session,view: action.type ? "PME" : "ST",},});
  }

  @Action(UploadFile)
  uploadFile(ctx: StateContext<DataModel>, upload: UploadFile) {
    console.log("upload file", upload)
    const req = this.http.post("data", upload);
    return req.pipe(
      tap((response: any) => {
        console.log("upload file response", response)
        if (response[upload.action] !== "OK") throw response["messages"];
        delete response[upload.action];
        delete response["timestamp"]
        console.log("upload file response", response)
        const assignedId = +Object.keys(response)[0],
        fields = ctx.getState()["fields"],
        contentIndex = fields["File"].indexOf("content");

        upload.assignedId = assignedId;
        response[assignedId][contentIndex] = "";

        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        if (upload.category == "Company") {
          //add it to company
          const company = this.store.selectSnapshot(DataQueries.currentCompany);
          ctx.setState(compose(addSimpleChildren("Company", company.id, "File", response, "name")));
        }
        else if (upload.category == "Post") {
          ctx.setState(compose(addSimpleChildren("Post", upload.target, "File", response, "name")));
        }
        let name: string = "File" + upload.assignedId!.toString()
          if (SingleCache.checkValueInCache(name)) {SingleCache.deleteValueByName(name)}
      })
    );
  }

  @Action(ModifyFile)
  modifyFile(ctx: StateContext<DataModel>, modify: ModifyFile) {
    console.log("modify file", modify)
    return this.http.post("data", modify).pipe(
      tap((response: any) => {
        console.log("modify file response", response)
        if (response[modify.action] != "OK") throw response["messages"];
        delete response[modify.action];
        delete response["timestamp"];
        const fileId = +Object.keys(response)[0]

        modify.fileId = fileId;

        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        if (modify.category == "Company") {
          const company = this.store.selectSnapshot(DataQueries.currentCompany);
          ctx.setState(compose(addSimpleChildren("Company", company.id, "File", response, "name")))
        }
        else if (modify.category == "Post") {
          ctx.setState(compose(addSimpleChildren("Post", modify.target, "File", response, "name")));
        }

        let name: string = "File" + fileId.toString()
        if (SingleCache.checkValueInCache(name)) {
          console.log("remove image from cache", name)
          SingleCache.deleteValueByName(name)
        }
      })
    );
  }

  @Action(TakePicture)
  takePicture(ctx: StateContext<DataModel>, picture: TakePicture) {
    // return this.http.post('data', picture).pipe(
    //   tap((response: any) => {
    //     if ( response[picture.action] !== 'OK' )
    //       throw response['messages']
    //     delete response[picture.action]
    //     const assignedId = +Object.keys(response)[0],
    //       fields = ctx.getState()['fields'],
    //       contentIndex = fields['File'].indexOf('content');
    //     picture.assignedId = assignedId;
    //     response[assignedId][contentIndex] = upload.fileBase64;
  }

  @Action(DeleteFile)
  deleteFile(ctx: StateContext<DataModel>, deletion: DeleteFile) {
    console.log("delete file", deletion)
    const req = this.http.get("data", deletion);
    return req.pipe(tap((response: any) => {
        console.log('delteFile response', response);
        if (response[deletion.action] !== "OK") throw response["messages"];

        delete response[deletion.action];
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(deleteIds("File", [deletion.id]));

        if(response.hasOwnProperty('Company')) {ctx.setState(update('Company', response['Company']))}
      })
    );
  }

  @Action(DeleteLabel)
  deleteLabel(ctx: StateContext<DataModel>, deletion: DeleteLabel) {
    console.log("DeleteLabel",  deletion)

    const req = this.http.get("data", deletion);
    return req.pipe(
      tap((response: any) => {
        console.log("DeleteLabel response", response);
      })
    )
  }

  @Action(UploadPost)
  createPost(ctx: StateContext<DataModel>, post: UploadPost) {
    console.log("create post", post)
    const profile = this.store.selectSnapshot(DataQueries.currentProfile),
      { files, ...form } = post,
      uploads = Object.keys(files).map(
        (key) => new UploadFile<"Post">(files[key], "post", key, "Post")
      ),
      req = this.http.post("data", form);

    return req.pipe(
      map((response: any) => {
        console.log('create post reponse', response);
        if (response[post.action] !== "OK") throw response["messages"];
        delete response[post.action];

        //add post, return its id
        const assignedId = +Object.keys(response['Post'])[0];
        // ctx.setState(addValues('Post', response))

        
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        if(response.hasOwnProperty('DatePost')){
          for (const datePost of response['DatePost']) {
            ctx.setState(addValues('DatePost', datePost))
          }
        }

        if(response.hasOwnProperty('DetailedPost')){
          for (const detailedPost of response['DetailedPost']) {
            ctx.setState(addValues('DetailedPost', detailedPost))
          }
        }
        // ctx.setState(addValues('Post', response['Post']))
        // console.log('company', profile.company);
        // const company = JSON.parse(JSON.stringify(profile.company));
        // company.posts.push(+Object.keys(response['Post'])[0])
        // ctx.setState(update('Company', company))
        // ctx.setState(addSimpleChildren("Company", profile.company.id, "Post", response['Post'] ));
        ctx.setState(addComplexChildren("Company", profile.company.id, "Post", response['Post'] ));

        // uploads.forEach((upload) => (upload.target = postId));


        return assignedId;
      }),
      concatMap((postId: number) => {
        console.log('post', postId);
        uploads.forEach((upload) => (upload.target = postId));
        //return this to wait for file downloads first
        return ctx.dispatch(uploads);
      })
    );
  }

  @Action(SwitchPostType)
  switchPostType(ctx: StateContext<DataModel>, switchType: SwitchPostType) {
    console.log("switch post type", switchType)
    return this.http.get("data", switchType).pipe(
      tap((response: any) => {
        console.log("switch post type response", response)
        if (response[switchType.action] !== "OK") throw response["messages"];

        delete response[switchType.action];
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(transformField("Post", switchType.id, "draft", (draft) => !draft));
      })
    );
  }

  @Action(DeletePost)
  deletePost(ctx: StateContext<DataModel>, deletion: DeletePost) {
    console.log("delete post", deletion)
    return this.http.get("data", deletion).pipe(
      tap((response: any) => {
        console.log('delete post response', response);
        if (response[deletion.action] !== "OK") throw response["messages"];

        delete response[deletion.action];
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(deleteIds("Post", [deletion.id]));
      })
    );
  }

  @Action(DuplicatePost)
  duplicatePost(ctx: StateContext<DataModel>, application: DuplicatePost) {
    console.log("duplicate post", application)
    const profile = this.store.selectSnapshot(DataQueries.currentProfile)!;
    return this.http.get("data", application).pipe(
      tap((response: any) => {
        console.log('duplicate post response', response);
        if (response[application.action] !== "OK") {
          this.inZone(() => this.info.show("error", response.messages, 2000));
          throw response.messages;
        }
        delete response[application.action];
        console.log('duplicatePost', response);
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(addComplexChildren("Company", profile.company.id, "Post", response));
        this.inZone(() => this.info.show("info", "Duplication réalisée", 2000));
      })
    );
  }

  @Action(DownloadFile)
  downloadFile(ctx: StateContext<DataModel>, download: DownloadFile) {
    const state = ctx.getState(),
      nameIndex = state.fields["File"].indexOf("name"),
      contentIndex = state.fields["File"].indexOf("content"),
      key = `file_${download.id}`,
      file = ctx.getState()["File"][download.id];

    //check if the file is already downloaded
    if (file && file[contentIndex] && !download.forceDownload) {
      return file[contentIndex];
    }

    //check if we are currently downloading the file
    let pending = this.getPending(key);
    if (pending) return pending;

    //download the file and register that we downloading;
    let req = this.http.get("data", download);
    pending = new Subject<string>();
    this.registerPending(key, pending);

    if (download.notify)
      this.inZone(() => {
        this.info.show(
          "info",
          `Téléchargement du fichier ${file[nameIndex] || ""}...`,
          2000
        );
      });

    return req.pipe(
      tap((response: any) => {
        console.log('download file response', response);
        if (response[download.action] !== "OK") {
          if (download.notify)
            this.inZone(() =>
              this.info.show("error", response["messages"], 5000)
            );
          throw response["messages"];
        }
        delete response[download.action];
        delete response["timestamp"];
        if (download.notify)
          this.inZone(() =>
            this.info.show(
              "success",
              `Fichier ${file[nameIndex]} téléchargé.`,
              1000
            )
          );
        //overwrite
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(addValues("File", response));
        //file is now downloaded
        pending!.next(response[contentIndex]);
        this.completePending(key);
      })
    );
  }

  @Action(ApplyPost)
  applyPost(ctx: StateContext<DataModel>, application: ApplyPost) {
    console.log("apply post", application)
    const profile = this.store.selectSnapshot(DataQueries.currentProfile)!;
    //{Post: 1, amount: 500, devis: 'Par heure', action: 'applyPost'}
    return this.http.get("data", application).pipe(
      tap((response: any) => {
        console.log('ApplyPost response', response);
        if (response[application.action] != "OK") throw response["messages"];

        delete response[application.action];
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(addValues('Candidate', response['Candidate']))
        ctx.setState(update('Post', response['Post']));
      })
    );
  }
  
  @Action(UnapplyPost)
  unapplyPost(ctx: StateContext<DataModel>, application: UnapplyPost) {
    const profile = this.store.selectSnapshot(DataQueries.currentProfile)!;
    console.log("UnapplyPOst ce que j'envoie au BACK", application)
    return this.http.get("data", application).pipe(
      tap((response: any) => {
        console.log('UnapplyPost response', response)
        if (response[application.action] != "OK") throw response["messages"];

        delete response[application.action];
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(deleteIds('Candidate', [response['Candidate']]))
        ctx.setState(update('Post', response['Post']));
      })
    );
  }

  @Action(CandidateViewed)
  candidateViewed(ctx: StateContext<DataModel>, application: CandidateViewed) {
    console.log("candidateViewed", application)
    const profile = this.store.selectSnapshot(DataQueries.currentProfile)!;
    return this.http.get("data", application).pipe(
      tap((response: any) => {
        console.log("candidateViewed response", response)
        if (response[application.action] !== "OK") {
          this.inZone(() => this.info.show("error", response.messages, 3000));
          throw response.messages;
        }
        delete response[application.action];
        console.log('CandidateViewed', response);
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(transformField("Candidate", application.candidateId, "isViewed", () => true));
      })
    );
  }

  @Action(ModifyAvailability)
  modifyAvailability(
    ctx: StateContext<DataModel>,
    availability: ModifyAvailability
  ) {
    console.log("modifyAvailability", availability)
    return this.http.post("data", availability).pipe(
      tap((response: any) => {
        console.log("modifyAvailability response", response)
        if (response[availability.action] != "OK") throw response["messages"];

        delete response[availability.action];
        const company = this.store.selectSnapshot(DataQueries.currentCompany);

        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(
          //doest work because it leaves old values
          //pushChildValues('Company', company.id, 'Disponibility', response, 'date')
          compose(replaceChildren("Company", company.id, "Disponibility", response))
        );
      })
    );
  }

  @Action(HandleApplication)
  handleApplication(ctx: StateContext<DataModel>, handle: HandleApplication) {
    const { post, ...data } = handle;
    console.log("handleAppication", handle)
    return this.http.get("data", data).pipe(
      tap((response: any) => {
        console.log("handleApplication response", response);
        if (response[handle.action] !== "OK") {
          this.inZone(() => this.info.show("error", response.messages, 3000));
          throw response.messages;
        }

        delete response[handle.action];
        const company = this.store.selectSnapshot(DataQueries.currentCompany);
        this.inZone(() => this.info.show("success", "Réponse envoyée.", 3000));
        this.slide.hide();
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        if (data["response"]) {
          ctx.setState(
            compose(
              deleteIds("Post", [handle.post.id]),
              addComplexChildren("Company", company.id, "Mission", response)
            )
          );
        } else
          ctx.setState(update('Post', response));
          ctx.setState(transformField('Candidate', handle.Candidate, 'isRefused', () => true))

      })

    );
  }

  @Action(BlockCompany)
  blockCompany(ctx: StateContext<DataModel>, block: BlockCompany) {
    console.log("blockCompany", block)
    const user = this.store.selectSnapshot(DataQueries.currentUser);
    return this.http.get("data", block).pipe(
      tap((response: any) => {
        console.log("blockCompany response", response)
        if (response[block.action] !== "OK") this.inZone(() => this.info.show("error", response.messages, 3000))
        else {
          delete response[block.action]; this.inZone(() => this.info.show("success", response.messages, 2000))
          let BlockedCandidates = this.store.selectSnapshot(DataQueries.getAll("BlockedCandidate"))
          let theBlocked = BlockedCandidates.filter((candidate) => candidate.blocked == block.companyId && candidate.blocker == user.company)[0]
          this.getUserDataService.emitDataChangeEvent(response.timestamp)
          delete response["timestamp"];
        if(theBlocked) {
            ctx.setState(update("BlockedCandidate", response))
          }
          else {
            ctx.setState(addValues("BlockedCandidate", response))
          }
        }
      })

    )
  }

  @Action(SignContract)
  signContract(ctx: StateContext<DataModel>, application: SignContract) {
    console.log("signContract", application)
    const profile = this.store.selectSnapshot(DataQueries.currentProfile)!;

    return this.http.get("data", application).pipe(
      tap((response: any) => {
        console.log("signContract response", response)
        if (response[application.action] !== "OK") {
          this.inZone(() => this.info.show("error", response.messages, 3000));
          throw response.messages;
        }
        let mission = this.store.selectSnapshot(DataQueries.getById("Mission", application.missionId))
        SingleCache.deleteValueByName("File" + mission?.contract.toString());
        delete response[application.action];
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(addComplexChildren("Company", profile.company.id, "Mission", response));

        if(application.view == "ST"){
          console.log("signed by ST")
          ctx.setState(transformField("Mission", application.missionId, "signedBySubContractor", () => true));
        } else if (application.view == "PME")
          console.log("signed by PME")
          ctx.setState(transformField("Mission", application.missionId, "signedByCompany", () => true));
      })
    );
  }

  @Action(CreateDetailedPost)
  createDetailedPost(ctx: StateContext<DataModel>, application: CreateDetailedPost) {
    console.log("createDetailedPost", application)
    const profile = this.store.selectSnapshot(DataQueries.currentProfile)!;
    const missionId = application.missionId
    console.log('misssionId', missionId);
    return this.http.post("data", application).pipe(
      tap((response: any) => {
        // if (response[application.action] !== "OK") {
        //   this.inZone(() => this.info.show("error", response.messages, 3000));
        //   throw response.messages;
        // }
        // delete response[application.action];
        console.log("createDetailedPost", response)
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(addComplexChildren(response["type"], response["fatherId"], "DetailedPost", response["detailedPost"]))
        if (response["detailedPost2"]){
          console.log('createDetailedPost add to Mission');
          ctx.setState(addComplexChildren("Mission", response["missionId"], "DetailedPost", response["detailedPost2"]))
        }
      })
    );
  }

  @Action(ModifyDetailedPost)
  modifyDetailedPost(ctx: StateContext<DataModel>, application: ModifyDetailedPost) {
    console.log("modifyDetailedPost", application)
    const profile = this.store.selectSnapshot(DataQueries.currentProfile)!;
    return this.http.post("data", application).pipe(
      tap((response: any) => {
        console.log("modifyDetailedPost response", response)
        if (response[application.action] !== "OK") {
          this.inZone(() => this.info.show("error", response.messages, 3000));
          throw response.messages;
        }
        delete response[application.action]
        console.log("modifyDetailedPost", response)
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        if (response["deleted"] == "yes") {
          console.log('modifyDetailedPost', response['detailedPostId']);
          ctx.setState(deleteIds("DetailedPost", [response["detailedPostId"]]));
          ctx.setState(update('DatePost', response["datePost"]));
        } else if (response["type"] == "DatePost") {
          console.log("modifyDetailedPost", response, response["detailedPost"])
          ctx.setState(addComplexChildren(response["type"], response["fatherId"], "DetailedPost", response["detailedPost"]))
        }
      })
    );
  }

  @Action(CreateSupervision)
  createSupervision(ctx: StateContext<DataModel>, application: CreateSupervision) {
    console.log("createSupervision", application)
    const profile = this.store.selectSnapshot(DataQueries.currentProfile)!;
    console.log('createSupervision', application);
    return this.http.post("data", application).pipe(
      tap((response: any) => {
        console.log('createSupervision', response);
        if (response[application.action] !== "OK") {
          this.inZone(() => this.info.show("error", response.messages, 3000));
          throw response.messages;
        }
        delete response[application.action];
        console.log("createSupervision", response, response["type"], response["type"] == "DatePost")
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        if (response["type"] == "DatePost") ctx.setState(addComplexChildren("DatePost", response["fatherId"], "Supervision", response["supervision"]))
        if (response["type"] == "DetailedPost") ctx.setState(addComplexChildren("DetailedPost",response["fatherId"], "Supervision", response["supervision"]))
      })
    );
  }

  @Action(ModifyMissionDate)
  modifyMissionDate(ctx: StateContext<DataModel>, application: ModifyMissionDate) {
    console.log("modifyMissionDate", application)
    const profile = this.store.selectSnapshot(DataQueries.currentProfile)!;
    return this.http.post("data", application).pipe(
      tap((response: any) => {
        if (response[application.action] !== "OK") {
          this.inZone(() => this.info.show("error", response.messages, 3000));
          throw response.messages;
        }
        delete response[application.action];
        
        console.log('modifyMissionDate', response);
        
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(addComplexChildren('Mission', response.mission.id,'DatePost', response.datePost))
      })
    );
  }

  @Action(ValidateMissionDate)
  validateMissionDate(ctx: StateContext<DataModel>, application: ValidateMissionDate) {
    const profile = this.store.selectSnapshot(DataQueries.currentProfile)!;
    console.log('validateMissionDate', ctx, application);
    return this.http.post("data", application).pipe(
      tap((response: any) => {
        console.log('validateMissionDate response', response);
        if (response[application.action] !== "OK") {
        this.inZone(() => this.info.show("error", response.messages, 3000));
          throw response.messages;
        } else {
          this.inZone(() =>
            this.info.show("info", "La mission est mise à jour", 3000)
          );
          delete response[application.action];

          this.getUserDataService.emitDataChangeEvent(response.timestamp)
          delete response["timestamp"];
          if(response.hasOwnProperty('update')){
            ctx.setState(update(response.type, response[response.type]))
          }
          else {
            if(response.hasOwnProperty('deleted')) {
              ctx.setState(deleteIds("DatePost", [response["fatherId"]]));
              ctx.setState(update('Mission', response["mission"]));
            } else if (application.state) {
              ctx.setState(addComplexChildren(response.type, response.fatherId,'DatePost', response.datePost))
            } else {
              ctx.setState(update('DatePost', response['datePost']))
            }
          }
          // console.log('validateMissionDate', profile.company.id, response.mission)
          // ctx.setState(addComplexChildren('Company', profile.company.id,'Mission', response.mission))
        }
      })
    );
  }

  @Action(CloseMission)
  closeMission(ctx: StateContext<DataModel>, application: CloseMission) {
    console.log("closeMission", application)
    const profile = this.store.selectSnapshot(DataQueries.currentProfile)!;
    return this.http.post("data", application).pipe(
      tap((response: any) => {
        if (response[application.action] !== "OK") {
          this.inZone(() => this.info.show("error", response.messages, 3000));
          throw response.messages;
        }
        delete response[application.action];
        console.log('Response', response)
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(update("Mission", response));

      })
    );
  }

  @Action(CloseMissionST)
  closeMissionST(ctx: StateContext<DataModel>, application: CloseMissionST) {
    console.log("closeMissionST", application)
    const profile = this.store.selectSnapshot(DataQueries.currentProfile)!;
    return this.http.post("data", application).pipe(
      tap((response: any) => {
        if (response[application.action] !== "OK") {
          this.inZone(() => this.info.show("error", response.messages, 3000));
          throw response.messages;
        }
        delete response[application.action];
        console.log('ReponseST', response)
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(update("Mission", response));
        // console.log("Dans CloseMissionST", this.store.selectSnapshot(DataQueries.getAll("Mission")))
      })
    );
  }

  @Action(NotificationViewed)
  notificationViewed(
    ctx: StateContext<DataModel>,
    application: NotificationViewed
  ) {
    console.log("notificationViewed", application)
    const profile = this.store.selectSnapshot(DataQueries.currentProfile)!;
    return this.http.post("data", application).pipe(
      tap((response: any) => {
        console.log('notificationViewed response', response);
        if (response[application.action] !== "OK") {
          this.inZone(() => this.info.show("error", response.messages, 3000));
          throw response.messages;
        }
        delete response[application.action];
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        console.log("les notifs ", response.Notification)
        ctx.setState(compose(addSimpleChildren("Company",profile.company.id,"Notification",response.Notification)));
      })
    );
  }

  @Action(PostNotificationViewed)
  PostNotificationViewed(ctx: StateContext<DataModel>,application: NotificationViewed) {
    console.log("PostNotificationViewed", application)
    const profile = this.store.selectSnapshot(DataQueries.currentProfile)!;
    return this.http.post("data", application).pipe(
      tap((response: any) => {
        console.log('notificationViewed response', response);
        if (response[application.action] !== "OK") {
          this.inZone(() => this.info.show("error", response.messages, 3000));
          throw response.messages;
        }
        delete response[application.action];
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(compose(addSimpleChildren("Company",profile.company.id,"Notification",response.Notification)));
      })
    );
  }

  //------------------------------------------------------------------
  // For temporary actions
  @Action(GetCompanies)
  getCompanies(ctx: StateContext<DataModel>, get: GetCompanies) {
    return this.http.get("initialize", get).pipe(
      tap((response: any) => {
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(compose(this.reader.readInitialData(response)[0],
            //very error prone
            //i really hate doing this
            produce((draft: any) => {
              draft.fields["Establishments"] = ["name","address","activity","siret","ntva",];
              return draft;
            })
          )
        );
      })
    );
  }

  @Action(SetFavorite)
  setFavorite(ctx: StateContext<DataModel>, favorite: SetFavorite) {
    console.log("setFavorite", favorite)
    const id = this.store.selectSnapshot(DataState.currentUserId);
    return this.http.get("data", favorite).pipe(
      tap((response: any) => {
        console.log('setFavorite response', response);
        if (response[favorite.action] !== "OK") {this.inZone(() => this.info.show("error", response.messages, 3000));}

        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(transformField("UserProfile", id, "favoritePosts", (favorites) => {
            if (favorite.value) return [...favorites, favorite.Post];
            else return favorites.filter((id) => favorite.Post !== id);
          })
        );
        if (favorite.value) {
          this.inZone(() =>
            this.info.show("success", "Annonce ajoutée au favoris.", 1000)
          );
        } else {
          this.inZone(() =>
            this.info.show("info", "Annonce retirée des favoris", 1000)
          );
        }
      })
    );
  }

  @Action(MarkViewed)
  markViewed(ctx: StateContext<DataModel>, view: MarkViewed) {
    console.log("markViewed", view)
    const user = this.store.selectSnapshot(DataQueries.currentUser);
    if (user.viewedPosts.includes(view.Post)) return;

    return this.http.get("data", view).pipe(
      tap((response: any) => {
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(transformField("UserProfile",user.id,"viewedPosts",(viewed: any) => {return [...viewed, view.Post];}));
      })
    );
  }

  @Action(InviteFriend)
  inviteFriend(ctx: StateContext<DataModel>, application: InviteFriend) {
    console.log("inviteFriend", application)
    const user = this.store.selectSnapshot(DataQueries.currentUser);
    return this.http.get("data", application).pipe(
      tap((response: any) => {
        console.log('inviteFriend response', response);
        if (application.register) {
          const token = application.register ? response.token : "";
          if (response[application.action] !== "OK") {
            this.inZone(() => this.info.show("error", response.messages, 3000));
          } else {
            if (application.register)
              this.inZone(() =>
                this.info.show("info", response.messages, 3000)
              );
            this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(transformField("UserProfile",user.id,"tokenFriend",(draft) => token));
          }
        }
      })
    );
  }

  @Action(BoostPost)
  boostPost(ctx: StateContext<DataModel>, boost: BoostPost) {
    console.log("boostPost", boost)
    return this.http.post("data", boost).pipe(
      tap((response: any) => {
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(transformField("Post",boost.postId,"boostTimestamp",() => {return response.UserProfile[boost.postId][22];}));
      })
    );
  }

  @Action(AskRecommandation)
  askRecommandation(ctx: StateContext<DataModel>, demand: AskRecommandation){
    console.log("askRecommandation", demand)
    const user = this.store.selectSnapshot(DataQueries.currentUser);
    return this.http.get("data", demand).pipe(
      tap((response: any) => {
        console.log('askRecommandation response', response)
        if (response[demand.action] !== "OK") {
          this.inZone(() => this.info.show("error", response.messages, 3000));
        }
        else {
          this.info.show("info", response.messages, 3000)
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(addValues("Recommandation", response))
      }
      })
    )
  }

  @Action(GiveRecommandation)
  giveRecommandation(ctx: StateContext<DataModel>, application : GiveRecommandation){
    console.log("giveRecommandation", application)
    const user = this.store.selectSnapshot(DataQueries.currentUser);
    return this.http.post("initialize", application).pipe(
      tap((response: any) => {
        console.log('giveRecommandation response', response)
        //write code to manage the response
        this.getUserDataService.emitDataChangeEvent(response.timestamp)
        delete response["timestamp"];
        ctx.setState(addValues("Recommandation", response))
      })
    )
  }

  @Action(GiveNotificationToken)
  giveNotificationToken(ctx: StateContext<DataModel>, token : GiveNotificationToken){
    const user = this.store.selectSnapshot(DataQueries.currentUser);
    return this.http.get("data", token).pipe(
      tap((response: any) => {
        console.log(response)
      })
    )
  }
}
//make a deep version of toJSON
export class DataQueries {
  static toJson<K extends DataTypes>(
    allFields: Record<string[]>,
    target: K,
    id: number,
    values: any[] | string
  ): Interface<K> {
    const fields = allFields[target];

    const output: any = {};
    if (Array.isArray(values)) {
      if (fields.length != values.length)
        throw `Value is probably not of type ${target}`;

      for (let i = 0; i < values.length; i++) {
        const name = fields[i],
          jsonName = NameMapping[name as TranslatedName] || name;

        output[jsonName] = values[i];
      }
    } else {
      output.name = values;
    }

    output.id = id;

    return output;
  }

  //think about optimizing selectors
  //maybe already set injectContainerState to false
  //each of these have seperate memoization

  @Selector([DataState.users, DataState.fields, DataState.currentUserId])
  static currentUser(
    profiles: Record<any[]>,
    fields: Record<string[]>,
    id: number
  ) {
    return DataQueries.toJson(fields, "UserProfile", id, profiles[id]);
  }

  @Selector([DataState.companies, DataState.fields, DataState.currentUserId])
  static currentCompany(
    companies: Record<any[]>,
    fields: Record<string[]>,
    id: number
  ) {
    return DataQueries.toJson(fields, "Company", id, companies[id]);
  }

  @Selector([DataQueries.currentUser, DataQueries.currentCompany])
  static currentProfile(user: User, company: Company) {
    return { user, company };
  }

  private static getDataById<K extends DataTypes>(type: K, id: number) {
    return createSelector(
      [DataState.getType(type)],
      (record: Record<any[]>) => {
        return record[id];
      }
    );
  }

  // a profile is a company
  static getProfileById(id: number) {
    return createSelector(
      [DataState.fields, DataState.companies],
      (fields: Record<string[]>, companies: Record<any[]>) => {
        const company = companies[id];

        if (!company) return null;
        return {
          user: null,
          company: DataQueries.toJson(fields, "Company", id, companies[id]),
        };
      }
    );
  }

  static getProfileByUserId(id: number) {
    return createSelector(
      [DataState.fields, DataState.users, DataState.companies],
      (
        fields: Record<string[]>,
        users: Record<any[]>,
        companies: Record<any[]>
      ) => {
        const companyIndex = fields["UserProfile"].indexOf("Company"),
          user = users[id],
          companyId = user?.[companyIndex];

        if (!user || companyId == undefined) return null;
        return {
          user: DataQueries.toJson(fields, "UserProfile", id, users[id]),
          company: DataQueries.toJson(
            fields,
            "Company",
            companyId,
            companies[companyId]
          ),
        };
      }
    );
  }

  static getById<K extends DataTypes>(type: K, id: number) {
    //no id => get All
    // console.log('getbyId', id, type);
    return createSelector(
      [DataState.fields, DataQueries.getDataById(type, id)],
      (fields: Record<string[]>, values: any[]) => {
        // console.log('getbyId', values, id, fields, type);
        return values ? DataQueries.toJson(fields, type, id, values) : null;
      }
    );
  }

  static getMany<K extends DataTypes>(type: K, ids: number[]) {
    return createSelector(
      [DataState.fields, DataState.getType(type)],
      (fields: Record<string[]>, record: Record<any[]>) => {
        return ids.map((id) => {
          const values = record[id];
          return DataQueries.toJson(fields, type, +id, values);
        });
      }
    );
  }

  static getAll<K extends DataTypes>(type: K) {
    //no id => get All
    return createSelector(
      [DataState.fields, DataState.getType(type)],
      (fields: Record<string[]>, record: Record<any[]>) => {
        return Object.keys(record).map((id) => {
          const values = record[id];
          return DataQueries.toJson(fields, type, +id, values);
        });
      }
    );
  }

  static contentOf<K extends DataTypes, V extends DataTypes>(
    parent: K,
    parentId: number,
    child: V
  ) {
    return createSelector(
      [
        DataState.fields,
        DataState.getType(child),
        DataQueries.getDataById(parent, parentId),
      ],
      (
        fields: Record<string[]>,
        childItems: Record<any[]>,
        parentItem: any[]
      ) => {
        const index = fields[parent].indexOf(child);
        if (index <= 0) throw `${child} is not a child of ${parent}.`;

        return parentItem[index].map((id: number) => childItems[id]);
      }
    );
  }

  static getProfileImage(id: number) {
    return createSelector(
      [
        DataState.fields,
        DataQueries.getDataById("Company", id),
        DataState.files,
      ],
      (fields: Record<string[]>, company: any[], files: any[]) => {
        const filesIndex = fields["Company"].indexOf("File"),
          natureIndex = fields["File"].indexOf("nature"),
          fileIds = company?.[filesIndex] || [];

        // console.log('getprofileImage', filesIndex, fileIds, natureIndex);
        for (let id of fileIds)
          if (files[id][natureIndex] == "userImage")
            return DataQueries.toJson(fields, "File", id, files[id]);
        return null;
      }
    );
  }
}

//type ChildOf<K extends DataTypes> = keyof Interface<K>;
//type ChildSequence<A extends DataTypes, B extends ChildOf<A>> = ChildOf<B>;

//Decorator
//Assumes object has store
//if an object or an observable is given, it won't query
//One thing that can be improved is how we deal with observable
//If component depend on the observable to retrieve the value, they kinda
//have to manage subscripton on their own
//a better way would be to memoize the value and use switchMap inside the setter
export function Query<K extends DataTypes>(type: K) {
  return function (target: any, key: string) {
    const hiddenKey = "#" + key;

    Object.defineProperty(target, key, {
      get(this: any) {
        return this[hiddenKey]
          ? this[hiddenKey].value
          : new Observable((subscriber) => {
              subscriber.next(null);
              subscriber.complete();
            });
      },
      set(this: any, id: any) {
        if (
          this[hiddenKey] &&
          (this[hiddenKey].id === id || this[hiddenKey].value === id)
        )
          return;
        if (typeof id == "number") {
          this[hiddenKey] = {
            id,
            value: this.store.select(DataQueries.getById(type, id)), //what about unsubscribe
          };
        } else if (id instanceof Observable) {
          this[hiddenKey] = { id: undefined, value: id };
        } else {
          this[hiddenKey] = { id: id.id, value: of(id) };
        }
      },
      enumerable: false,
      configurable: false,
    });
  };
}

//Same as Query but returns a snapshot
export function Snapshot<K extends DataTypes>(type: K) {
  return function (target: any, key: string) {
    const hiddenKey = "#" + key;

    Object.defineProperty(target, key, {
      get(this: any) {
        return this[hiddenKey] ? this[hiddenKey].value : null;
      },
      set(this: any, id: any) {
        if (
          this[hiddenKey] &&
          (this[hiddenKey].id === id || this[hiddenKey].value === id)
        )
          return; //id
        if (typeof id == "number") {
          this[hiddenKey] = {
            id,
            value: this.store.selectSnapshot(DataQueries.getById(type, id)),
          };
        } else {
          this[hiddenKey] = { id: id.id, value: id };
        }
      },
      enumerable: false,
      configurable: false,
    });
  };
}

export function QueryAll<K extends DataTypes>(type: K) {
  return function (target: any, key: string) {
    const hiddenKey = "#" + key;

    Object.defineProperty(target, key, {
      get(this: any) {
        if (!this[hiddenKey])
          this[hiddenKey] = this.store.select(DataQueries.getAll(type));
        return this[hiddenKey];
      },
      enumerable: false,
      configurable: false,
    });
  };
}

export function SnapshotAll<K extends DataTypes>(type: K) {
  return function (target: any, key: string) {
    const hiddenKey = "#" + key;

    Object.defineProperty(target, key, {
      get(this: any) {
        if (!this[hiddenKey])
          this[hiddenKey] = this.store.selectSnapshot(DataQueries.getAll(type));
        return this[hiddenKey];
      },
      enumerable: false,
      configurable: false,
    });
  };
}

export function QueryArray<K extends DataTypes>(type: K) {
  return function (target: any, key: string) {
    const hiddenKey = "#" + key;

    Object.defineProperty(target, key, {
      get(this: any) {
        return this[hiddenKey] ? this[hiddenKey] : [];
      },
      set(this: any, ids: number[]) {
        this[hiddenKey] = this.store.select(DataQueries.getMany(type, ids));
      },
      enumerable: false,
      configurable: false,
    });
  };
}

export function SnapshotArray<K extends DataTypes>(type: K) {
  return function (target: any, key: string) {
    const hiddenKey = "#" + key;

    Object.defineProperty(target, key, {
      get(this: any) {
        return this[hiddenKey] ? this[hiddenKey] : [];
      },
      set(this: any, ids: number[]) {
        this[hiddenKey] = this.store.selectSnapshot(
          DataQueries.getMany(type, ids)
        );
      },
      enumerable: false,
      configurable: false,
    });
  };
}

export function QueryProfile(config = { byUserId: false }) {
  return function (target: any, key: string) {
    const hiddenKey = "#" + key;

    Object.defineProperty(target, key, {
      get(this: any) {
        return this[hiddenKey]
          ? this[hiddenKey].value
          : new Observable((subscriber) => {
              subscriber.next(null);
              subscriber.complete();
              subscriber.unsubscribe();
            });
      },
      set(this: any, id: any) {
        if (
          this[hiddenKey] &&
          (this[hiddenKey].id === id || this[hiddenKey].value === id)
        )
          return;
        if (typeof id == "number") {
          this[hiddenKey] = {
            id,
            value: this.store.select(
              config.byUserId
                ? DataQueries.getProfileByUserId(id)
                : DataQueries.getProfileById(id)
            ),
          };
        } else if (id instanceof Observable) {
          this[hiddenKey] = { id: undefined, value: id };
        } else {
          //this is wasteful because it can set multiple times
          //but apparently fires as many
          this[hiddenKey] = { id: id.id, value: of(id) };
          //but this doesn't work :(
          // this[hiddenKey] = { id: id.id, value: id }
        }
      },
      enumerable: false,
      configurable: false,
    });
  };
}
