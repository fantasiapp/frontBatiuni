import { Injectable } from "@angular/core";
import { Action, createSelector, Selector, State, StateContext, Store } from "@ngxs/store";
import { Observable, of, Subject } from "rxjs";
import { tap } from "rxjs/operators";
import { HttpService } from "src/app/services/http.service";
import { number } from "src/validators/regex";
import { GetGeneralData } from "../data/data.actions";
import { DownloadFile, GetUserData, ModifyUserProfile } from "../user/user.actions";
import { Company, Interface, User } from "./data.interfaces";
import { DataReader, NameMapping } from "./data.mapper";

type Record<T> = {
  [key: string]: T;
};

export type DataTypes = 'Job' | 'Label' | 'Role' | 'UserProfile' | 'Company' |
  'Post' | 'DetailedPost' | 'Supervision' | 'Disponibility' | 'File' |
  'JobForCompany' | 'LabelForCompany' | 'JobApplication' | 'Mission'; //..

export interface DataModel {
  fields: Record<string[]>;
  session: {
    currentUser: number
  };
  [key: string]: Record<any>;
};

export class Load<K extends DataTypes = any> {
  static readonly type = '[Data] Load';
  constructor(public data: K, public fields: string[], public values: Record<any>) {}
};

export class Concat<K extends DataTypes = any> {
  static readonly type = '[Data] Concat';
  constructor(public data: K, public values: Record<any>) {}
};

export class Delete<K extends DataTypes = any> {
  static readonly type = '[Data] Delete';
  constructor(public data: K, public ids: number | number[]) {}
};

export class Mutate<K extends DataTypes = any> {
  static readonly type = '[Data] Mutate';
  constructor(public data: K, public values: Record<any>) {}
};

export class Clear {
  static readonly type = '[Data] Clear';
  constructor(public data?: string) {}
};

//maybe use immer
@State<DataModel>({
  name: 'd',
  defaults: {
    fields: {},
    session: {
      currentUser: 0
    }
  }
})
@Injectable()
export class DataState {

  constructor(private http: HttpService, private store: Store, private reader: DataReader) {}

  @Action(GetGeneralData)
  getGeneralData() {    
    //eventually make a local storage service
    let data = localStorage.getItem('general-data'), req;
    req = data ? of(JSON.parse(data)) : this.http.get('initialize', {action: 'getGeneralData'});

    return req.pipe(
      tap((response: any) => {
        localStorage.setItem('general-data', JSON.stringify(response));
        this.reader.readStaticData(response);
      }) 
    );
  }

  @Action(GetUserData)
  getUserData(ctx: StateContext<DataModel>, action: GetUserData) {
    const req = this.http.get('data', { action: action.action })
    return req.pipe(
      tap((response: any) => {
        this.reader.readInitialData(response);
        ctx.patchState({
          session: { currentUser: response['currentUser'] }
        });
      })
    );
  }

  @Action(ModifyUserProfile)
  modifyUser(ctx: StateContext<DataModel>, action: ModifyUserProfile) {
    const {files, ...modifyAction} = action;
    const req = this.http.post('data', modifyAction);

    console.log(Object.keys(action.adminFiles));
    return req.pipe(
      tap((response: any) => {
        if ( response[action.action] !== 'OK' )
          throw response['messages'];
        
        delete response[action.action];
        this.reader.readManyUpdates(response);
      })
    )
  }

  @Action(DownloadFile)
  downloadFile(ctx: StateContext<DataModel>, download: DownloadFile) {
    let req;
    const state = ctx.getState(),
      file = state['File'][download.id],
      contentIndex = state.fields['File'].indexOf('content');
    
    if ( file[contentIndex] instanceof Observable ) return file[contentIndex];
    
    const observedFile = file.slice(); observedFile[contentIndex] = new Subject<string>();
    this.store.dispatch(new Concat('File', observedFile));
    
    req = this.http.get('data', download)
    return req.pipe(
      tap((response: any) => {
        if ( response[download.action] !== 'OK' ) throw response['messages'];
        delete response[download.action];
        observedFile[contentIndex].next(response[contentIndex]);
        observedFile[contentIndex].complete();
        this.store.dispatch(new Concat('File', response));
      })
    );
  }

  @Action(Load)
  load(ctx: StateContext<DataModel>, load: Load) {
    const current = ctx.getState();
    ctx.patchState({
      fields: { ...current.fields, [load.data]: load.fields },
      [load.data]: load.values
    });
  }

  private concatValues(state: DataModel, target: DataTypes, values: Record<any>) {
    const current = state[target] || {};
    return {[target]: {...current, ...values}};
  }

  @Action(Concat)
  concat(ctx: StateContext<DataModel>, concat: Concat) {
    if ( !Object.keys(concat.values).length )
      return;
    
    ctx.patchState(
      this.concatValues(ctx.getState(), concat.data, concat.values)
    );
  }

  private deleteIds(state: DataModel, target: DataTypes, ids: number[]) {
    const current = state[target] || {};

    if ( !ids.length ) return current;
    const remainingIds = Object.keys(current).filter(
      key => !(ids as number[]).includes(+key)
    );

    const remaining: Record<any> = {};
    for ( let id of remainingIds)
      remaining[id] = current[id];
    
    return {[target]: remaining};
  }

  @Action(Delete)
  delete(ctx: StateContext<DataModel>, del: Delete) {
    const state = ctx.getState(),
      ids = typeof del.ids == 'number' ? [del.ids] : del.ids;

    if ( !state[del.data] ) return;
    
    ctx.patchState(
      this.deleteIds(state, del.data, ids)
    );
  }
  
  @Action(Mutate)
  mutate(ctx: StateContext<DataModel>, mutate: Mutate) {
    const state = ctx.getState(),
      current = state[mutate.data],
      fields = state.fields[mutate.data];
    
    let changes: Record<any> = {};
    
    if ( !current ) return;

    //This assumes that data has no conflicts
    Object.entries<any>(mutate.values).forEach(([id, values]) => {
      const old = current[id];
      if ( !old ) return;
      for ( let i = 0; i < old.length; i++ ) {
        if ( Array.isArray(old[i]) ) {
          //delete old JobForCompany, Files, etc... wasteful
          if ( old[i].length )
            changes = {...changes, ...(this.deleteIds(state, fields[i] as DataTypes, old[i]))}

          const keys = Object.keys(values[i]);
          if ( keys.length)
            changes = { ...changes, ...(this.concatValues(state, fields[i] as DataTypes, values[i]))};
        
          values[i] = keys.map(x => +x);
        } 
      }
    });

    //overwrite
    ctx.patchState({...changes, [mutate.data]: mutate.values});
  }

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
        currentUser: 0
      }
    });
  }

  @Selector()
  static fields(state: DataModel) {
    return state.fields;
  }

  //don't injectContainerState
  @Selector()
  static currentUserId(state: DataModel) {
    return state.session.currentUser;
  };

  static getType<K extends DataTypes>(type: K) {
    return createSelector([DataState], (state: DataModel) => {
      return state[type] || {};
    });
  };
};

export class DataQueries {
  static toJson<K extends DataTypes>(allFields: Record<string[]>, target: K, id: number, values: any[]): Interface<K> {
    const fields = allFields[target];
    if ( !fields )
      throw `No structure with name ${target}`;
      
    if ( fields.length != values.length )
      throw `Value is probably not of type ${target}`;
    
    const output: any = {};
    for ( let i = 0; i < values.length; i++ ) {
      const name = fields[i],
        jsonName = NameMapping[name] || name;
      output[jsonName] = values[i];
    }

    output.id = id;

    return output;
  }

  //think about optimizing selectors
  //maybe already set injectContainerState to false
  //each of these have seperate memoization

  @Selector([DataState.getType("UserProfile"), DataState.fields, DataState.currentUserId])
  static currentUser(profiles: Record<any[]>, fields: Record<string[]>, id: number) {
    return DataQueries.toJson(fields, "UserProfile", id, profiles[id]);
  }

  @Selector([DataState.getType("Company"), DataState.fields, DataState.currentUserId])
  static currentCompany(profiles: Record<any[]>, fields: Record<string[]>, id: number) {
    return DataQueries.toJson(fields, "Company", id, profiles[id]);
  }

  @Selector([DataQueries.currentUser, DataQueries.currentCompany])
  static currentProfile(user: User, company: Company) {
    return {user, company};
  };

  private static getDataById<K extends DataTypes>(type: K, id: number) {
    //no id => get All
    return createSelector([DataState.getType(type)], (record: Record<any[]>) => {
      return record[id];
    });
  }

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

  private static contentOf<K extends DataTypes, V extends DataTypes>(parent: K, parentId: number, child: V) {
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
        if ( typeof id == 'number' ) {
          if ( this[hiddenKey] && this[hiddenKey].id === id ) return;
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

export function Snapshot<K extends DataTypes>(type: K) {
  return function(target: any, key: string) {
    const hiddenKey = '#' + key;

    Object.defineProperty(target, key, {
      get(this: any) {
        return this[hiddenKey] ? this[hiddenKey].value : null;
      },
      set(this: any, id: any) {
        if ( typeof id == 'number' ) {
          if ( this[hiddenKey] && this[hiddenKey].id === id ) return; //id
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