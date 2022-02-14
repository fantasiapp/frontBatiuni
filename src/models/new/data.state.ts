import { Injectable } from "@angular/core";
import { Action, createSelector, Selector, State, StateContext, StateOperator, Store } from "@ngxs/store";
import { Observable, of, Subject } from "rxjs";
import { concatMap, mergeMap, tap } from "rxjs/operators";
import { HttpService } from "src/app/services/http.service";
import { GetGeneralData } from "../data/data.actions";
import { ChangeProfilePicture, ChangeProfileType, DownloadFile, GetUserData, ModifyUserProfile, UploadFile } from "../user/user.actions";
import { Company, Interface, User } from "./data.interfaces";
import { DataReader, NameMapping } from "./data.mapper";
import { Record, DataTypes } from "./data.interfaces";
import { addValues, compose, deleteIds, pushChildValues } from "./state.operators";
import produce from "immer";
import { Logout } from "../auth/auth.actions";
import { InfoService } from "src/app/shared/components/info/info.component";

export interface DataModel {
  fields: Record<string[]>;
  session: {
    currentUser: number;
    view: 'ST' | 'PME';
  };
  [key: string]: Record<any>;
};

export class Clear {
  static readonly type = '[Data] Clear';
  constructor(public data?: string) {}
};

@State<DataModel>({
  name: 'd',
  defaults: {
    fields: {},
    session: {
      currentUser: 0,
      view: 'ST'
    }
  }
})
@Injectable()
export class DataState {

  constructor(
    private store: Store, private reader: DataReader,
    private http: HttpService, private info: InfoService
  ) {}

  private pending$: Record<Subject<any>> = {};

  private registerPending<T>(key: string, pending: Subject<T>) {
    this.pending$[key] = pending;
    return key;
  };

  private getPending<T = any>(key: string): Subject<T> | undefined {
    return this.pending$[key];
  }

  private completePending<T = any>(key: string): void {
    const pending = this.getPending(key);
    if ( pending ) {
      pending.complete();
      delete this.pending$[key];
    }
  };


  @Action(Clear)
  clear(ctx: StateContext<DataModel>, clear: Clear) {
    const current = ctx.getState();
    if ( clear.data )
      ctx.patchState({
        [clear.data]: {},
        fields: {...current.fields, [clear.data]: []}
      });
    
    else ctx.setState({
      fields: {},
      session: {
        currentUser: 0,
        view: 'ST'
      }
    });
  }

  @Selector()
  static fields(state: DataModel) {
    return state.fields;
  }

  //try to avoid container state in the future
  @Selector()
  static currentUserId(state: DataModel) {
    return state.session.currentUser;
  };

  @Selector()
  static view(state: DataModel) {
    return state.session.view;
  };

  @Selector([DataState])
  static companies(state: DataModel) {
    console.log('Company: state change')
    return state['Company'] || {};
  }

  @Selector([DataState])
  static users(state: DataModel) {
    console.log('UserProfile: state change');
    return state['UserProfile'] || {};
  }

  @Selector([DataState])
  static files(state: DataModel) {
    return state['File'] || {};
  }

  @Selector([DataState])
  static posts(state: DataModel) {
    return state['Post'] || {};
  }

  static getType<K extends DataTypes>(type: K) {
    return createSelector([DataState], (state: DataModel) => {
      return state[type] || {};
    });
  };

  //------------------------------------------------------------------------
  @Action(GetGeneralData)
  getGeneralData(ctx: StateContext<DataModel>) {    
    //eventually make a local storage service
    let data = localStorage.getItem('general-data'), req;
    req = data ? of(JSON.parse(data)) : this.http.get('initialize', {action: 'getGeneralData'});

    return req.pipe(
      tap((response: any) => {
        localStorage.setItem('general-data', JSON.stringify(response));
        const operations = this.reader.readStaticData(response);
        ctx.setState(compose(...operations));
      }) 
    );
  }

  @Action(GetUserData)
  getUserData(ctx: StateContext<DataModel>, action: GetUserData) {
    const req = this.http.get('data', { action: action.action });
    
    return req.pipe(
      tap((response: any) => {
        const loadOperations = this.reader.readInitialData(response),
          sessionOperation = this.reader.readCurrentSession(response);

        ctx.setState(compose(...loadOperations, sessionOperation));
      })
    );
  }

  @Action(Logout)
  logout(ctx: StateContext<DataModel>) {
    ctx.setState({fields: {}, session: {view: 'ST', currentUser: 0}});
  }

  @Action(ModifyUserProfile)
  modifyUser(ctx: StateContext<DataModel>, modify: ModifyUserProfile) {
    const {labelFiles, adminFiles, ...modifyAction} = modify;
    let req;
    if ( modifyAction.onlyFiles )
      req = of({[modify.action]: 'OK'});
    else 
      req = this.http.post('data', modifyAction);

    return req.pipe(
      tap((response: any) => {
        if ( response[modify.action] !== 'OK' )
          throw response['messages'];
        
        delete response[modify.action];

        ctx.setState(compose(...this.reader.readManyUpdates(response)));
      }),
      concatMap(() => {
        console.log('upload files');
        labelFiles.forEach(file => ctx.dispatch(new UploadFile(file, 'labels', file.nature, 'Company')));
        Object.keys(adminFiles).forEach(name => ctx.dispatch(new UploadFile(adminFiles[name], 'admin', name, 'Company')))
        return of(true);
      })
    )
  }

  @Action(ChangeProfilePicture)
  changeProfilePicture(ctx: StateContext<DataModel>, picture: ChangeProfilePicture) {
    const state = ctx.getState(),
      profile = this.store.selectSnapshot(DataQueries.currentProfile),
      image = this.store.selectSnapshot(DataQueries.getProfileImage(profile.company.id)),
      req = this.http.post('data', picture);
        
    return req.pipe(
      tap((response: any) => {
        if ( response[picture.action] !== 'OK' )
          throw response['messages'];
        
        ctx.setState(compose(
          deleteIds('File', image ? [image.id] : []),
          addValues('File', response)
        ));
      })
    )
  };

  @Action(ChangeProfileType)
  changeProfileType(ctx: StateContext<DataModel>, action: ChangeProfileType) {
    const state = ctx.getState();
    return ctx.patchState({
      session: {
        ...state.session,
        view: action.type ? 'PME' : 'ST'
      }
    });
  }

  @Action(UploadFile)
  uploadFile(ctx: StateContext<DataModel>, upload: UploadFile) {
    console.log('>>   sending', upload);

    const req = this.http.post('data', upload);
    return req.pipe(
      tap((response: any) => {
        if ( response[upload.action] !== 'OK' )
          throw response['messages'];
        delete response[upload.action];

        console.log('>>', response);
        
        const assignedId = Object.keys(response)[0],
          fields = ctx.getState()['fields'],
          contentIndex = fields['File'].indexOf('content');
        
        response[assignedId][contentIndex] = upload.fileBase64;
        if ( upload.category == 'Company' ) {
          //add it to company
          const company = this.store.selectSnapshot(DataQueries.currentCompany);
          ctx.setState(pushChildValues('Company', company.id, 'File', response, 'name'));
        }

      })
    )
  };

  @Action(DownloadFile)
  downloadFile(ctx: StateContext<DataModel>, download: DownloadFile) {
    const state = ctx.getState(),
      nameIndex = state.fields['File'].indexOf('name'),
      contentIndex = state.fields['File'].indexOf('content'),
      key = `file_${download.id}`,
      file = ctx.getState()['File'][download.id];
    
    //check if the file is already downloaded
    if ( file && file[contentIndex] )
      return file.content;
    
    //check if we are currently downloading the file
    let pending = this.getPending(key);
    if ( pending ) return pending;
    
    //download the file and register that we downloading;
    let req = this.http.get('data', download);
    pending = new Subject<string>();
    this.registerPending(key, pending);

    if ( download.notify ) this.info.show("info", `Téléchargement du fichier ${file[nameIndex] || ''}...`)
    
    return req.pipe(
      tap((response: any) => {
        if ( response[download.action] !== 'OK' ) {
          if ( download.notify ) this.info.show('error', response['messages'], 5000);
          throw response['messages'];
        }
        delete response[download.action];
        if ( download.notify ) this.info.show('success', `Fichier ${file[nameIndex]} téléchargé.`, 1000);
        //overwrite
        ctx.setState(addValues('File', response));
        //file is now downloaded
        pending!.next(response[contentIndex]);
        this.completePending(key);
      })
    );
  }
};

//make a deep version of toJSON

export class DataQueries {
  static toJson<K extends DataTypes>(allFields: Record<string[]>, target: K, id: number, values: any[] | string): Interface<K> {
    const fields = allFields[target];
    
    const output: any = {};
    if ( Array.isArray(values) ) {
      if ( fields.length != values.length )
      throw `Value is probably not of type ${target}`;
    
      for ( let i = 0; i < values.length; i++ ) {
        const name = fields[i],
          jsonName = NameMapping[name] || name;
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
  static currentUser(profiles: Record<any[]>, fields: Record<string[]>, id: number) {
    console.log('current user change');
    return DataQueries.toJson(fields, "UserProfile", id, profiles[id]);
  }

  @Selector([DataState.companies, DataState.fields, DataState.currentUserId])
  static currentCompany(companies: Record<any[]>, fields: Record<string[]>, id: number) {
    console.log('company change');
    return DataQueries.toJson(fields, "Company", id, companies[id]);
  }

  @Selector([DataQueries.currentUser, DataQueries.currentCompany])
  static currentProfile(user: User, company: Company) {
    return {user, company};
  };

  private static getDataById<K extends DataTypes>(type: K, id: number) {
    return createSelector([DataState.getType(type)], (record: Record<any[]>) => {
      return record[id];
    });
  }

  // a profile is a company
  static getProfileById(id: number) {
    return createSelector([DataState.fields, DataState.companies],
      (fields: Record<string[]>, companies: Record<any[]>) => {
      const company = companies[id];
      
      if ( !company ) return null;
      return {
        user: null,
        company: DataQueries.toJson(fields, 'Company', id, companies[id])
      };
    });
  }

  static getProfileByUserId(id: number) {
    return createSelector([DataState.fields, DataState.users, DataState.companies],
      (fields: Record<string[]>, users: Record<any[]>, companies: Record<any[]>) => {
      const companyIndex = fields['UserProfile'].indexOf('Company'),
        user = users[id],
        companyId = user?.[companyIndex];
      
      if ( !user || companyId == undefined ) return null;
      return {
        user: DataQueries.toJson(fields, 'UserProfile', id, users[id]),
        company: DataQueries.toJson(fields, 'Company', companyId, companies[companyId])
      };
    });
  };

  static getById<K extends DataTypes>(type: K, id: number) {
    //no id => get All
    return createSelector([DataState.fields, DataQueries.getDataById(type, id)], (fields: Record<string[]>, values: any[]) => {
      return values ? DataQueries.toJson(fields, type, id, values) : null
    });
  }

  static getMany<K extends DataTypes>(type: K, ids: number[]) {
    return createSelector([DataState.fields, DataState.getType(type)], (fields: Record<string[]>, record: Record<any[]>) => {
      return ids.map(id => {
        const values = record[id];
        return DataQueries.toJson(fields, type, +id, values);
      });
    });
  }

  static getAll<K extends DataTypes>(type: K) {
    //no id => get All
    return createSelector([DataState.fields, DataState.getType(type)], (fields: Record<string[]>, record: Record<any[]>) => {
      return Object.keys(record).map(id => {
        const values = record[id];
        return DataQueries.toJson(fields, type, +id, values);
      })
    });
  }

  static contentOf<K extends DataTypes, V extends DataTypes>(parent: K, parentId: number, child: V) {
    return createSelector(
      [DataState.fields, DataState.getType(child), DataQueries.getDataById(parent, parentId)],
      (fields: Record<string[]>, childItems: Record<any[]>, parentItem: any[]) => {
        const index = fields[parent].indexOf(child);
        if ( index <= 0 )
          throw `${child} is not a child of ${parent}.`;
        
        return parentItem[index].map((id: number) => childItems[id]);
      }
    )
  };

  static getProfileImage(id: number) {
    return createSelector( [DataState.fields, DataQueries.getDataById('Company', id), DataState.getType('File')],
      (fields: Record<string[]>, company: any[], files: any[]) => {
        const filesIndex = fields['Company'].indexOf('File'),
          natureIndex = fields['File'].indexOf('nature'),
          fileIds = company?.[filesIndex] || [];
        
        for ( let id of fileIds )
          if ( files[id][natureIndex] == 'userImage' )
            return DataQueries.toJson(fields, 'File', id, files[id]);
        return null;
      }
    )
  };

  
};

//Decorator
//Assumes object has store
//if an object or an observable is given, it won't query
export function Query<K extends DataTypes>(type: K) {
  return function(target: any, key: string) {
    const hiddenKey = '#' + key;

    Object.defineProperty(target, key, {
      get(this: any) {
        return this[hiddenKey] ? this[hiddenKey].value : new Observable(subscriber => {
          subscriber.next(null);
          subscriber.complete();
        });
      },
      set(this: any, id: any) {
        if ( this[hiddenKey] && (this[hiddenKey].id === id || this[hiddenKey].value === id) ) return;
        if ( typeof id == 'number' ) {
          this[hiddenKey] = {
            id,
            value: this.store.select(DataQueries.getById(type, id)) //what about unsubscribe
          };
        } else if ( id instanceof Observable ) {
          this[hiddenKey] = { id: undefined, value: id }
        } else {
          this[hiddenKey] = { id: id.id, value: of(id) }
        }
      },
      enumerable: false,
      configurable: false,
    });
  }
};

//Same as Query but returns a snapshot
export function Snapshot<K extends DataTypes>(type: K) {
  return function(target: any, key: string) {
    const hiddenKey = '#' + key;

    Object.defineProperty(target, key, {
      get(this: any) {
        return this[hiddenKey] ? this[hiddenKey].value : null;
      },
      set(this: any, id: any) {
        if ( this[hiddenKey] && (this[hiddenKey].id === id || this[hiddenKey].value === id) ) return; //id
        if ( typeof id == 'number' ) {
          this[hiddenKey] = {
            id,
            value: this.store.selectSnapshot(DataQueries.getById(type, id))
          };
        } else {
          this[hiddenKey] = { id: id.id, value: id }
        }
      },
      enumerable: false,
      configurable: false,
    });
  }
};

export function QueryAll<K extends DataTypes>(type: K) {
  return function(target: any, key: string) {
    const hiddenKey = '#' + key;

    Object.defineProperty(target, key, {
      get(this: any) {
        if ( !this[hiddenKey] ) this[hiddenKey] = this.store.select(DataQueries.getAll(type));
        return this[hiddenKey];
      },
      enumerable: false,
      configurable: false,
    });
  }
};

export function SnapshotAll<K extends DataTypes>(type: K) {
  return function(target: any, key: string) {
    const hiddenKey = '#' + key;

    Object.defineProperty(target, key, {
      get(this: any) {
        if ( !this[hiddenKey] ) this[hiddenKey] = this.store.selectSnapshot(DataQueries.getAll(type));
        return this[hiddenKey];
      },
      enumerable: false,
      configurable: false,
    });
  }
};

export function QueryArray<K extends DataTypes>(type: K) {
  return function(target: any, key: string) {
    const hiddenKey = '#' + key;

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
  }
};

export function SnapshotArray<K extends DataTypes>(type: K) {
  return function(target: any, key: string) {
    const hiddenKey = '#' + key;

    Object.defineProperty(target, key, {
      get(this: any) {
        return this[hiddenKey] ? this[hiddenKey] : null;
      },
      set(this: any, ids: number[]) {
        this[hiddenKey] = this.store.selectSnapshot(DataQueries.getMany(type, ids));
      },
      enumerable: false,
      configurable: false,
    });
  }
}

export function QueryProfile(byUserId: boolean = false) {
  return function(target: any, key: string) {
    const hiddenKey = '#' + key;

    Object.defineProperty(target, key, {
      get(this: any) {
        return this[hiddenKey] ? this[hiddenKey].value : new Observable(subscriber => {
          subscriber.next(null);
          subscriber.complete();
          subscriber.unsubscribe();
        });
      },
      set(this: any, id: any) {
        if ( this[hiddenKey] && (this[hiddenKey].id === id || this[hiddenKey].value === id) ) return;
        if ( typeof id == 'number' ) {
          this[hiddenKey] = {
            id,
            value: byUserId ?
              this.store.select(DataQueries.getProfileByUserId(id)) :
              this.store.select(DataQueries.getProfileById(id))
          }
        } else if ( id instanceof Observable ) {
          this[hiddenKey] = { id: undefined, value: id }
        } else {
          //this is wasteful because it can set multiple times
          //but apparently fires as many
          this[hiddenKey] = { id: id.id, value: of(id) }
          //but this doesn't work :(
          // this[hiddenKey] = { id: id.id, value: id }
        }
      },
      enumerable: false,
      configurable: false,
    });
  }
};