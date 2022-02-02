import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, createSelector, Selector, State, StateContext, Store } from "@ngxs/store";
import { of, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { HttpService } from "src/app/services/http.service";
import { number } from "src/validators/regex";
import { DeleteData, GetGeneralData, StoreData } from "./data.actions";
import { Mapper, Post, PostRow } from "./data.model";

@State({
  name: 'data',
  defaults: {}
})
@Injectable()
export class DataState {

  constructor(private http: HttpService) {}

  @Action(GetGeneralData)
  getGeneralData(ctx: StateContext<any>, action: GetGeneralData) {    
    //eventually make a local storage service
    let generalData = localStorage.getItem('general-data'), req;
    req = generalData ? of(JSON.parse(generalData)) : this.http.get('initialize', {action: 'getGeneralData'});

    return req.pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(err);
        return throwError('fatal error while retrieving general application data.');
      }),
      tap((response: any) => {
        Mapper.staticMap(response);
        localStorage.setItem('general-data', JSON.stringify(response));
      }) 
    );
  }

  @Action(StoreData)
  storeData(ctx: StateContext<any>, action: StoreData) {
    const state = ctx.getState(),
      current = state[action.name] || [],
      table = action.row;
  
    if ( action.type == 'delete' ) {
      console.log('got delete post');
      return ctx.patchState({[action.name]: current.filter((value: any) => value.id != action.target)});
    } else if ( action.type == 'add' ) {
      return ctx.patchState({[action.name]: [...current, table.getById(action.target)!.serialize()]})
    } else if ( action.type == 'modify') {
      return ctx.patchState({[action.name]: current.map(
        (item: Post, index: number) => item.id == action.target ?
          table.getById(item.id)!.serialize() : item
      )});
    } else {
      return ctx.patchState({
        [action.name]: table.getAll().map((value: any) => value.serialize())
      });
    }
  };

  @Action(DeleteData)
  deleteData(ctx: StateContext<any>, action: DeleteData) {
    ctx.patchState({[action.name]: []});
  }

  static get(type: string) {
    return createSelector([DataState], (state: any) => {
      return state[type] || [];
    })
  }
};

function LoadData(LoadData: any) {
  throw new Error("Function not implemented.");
}
