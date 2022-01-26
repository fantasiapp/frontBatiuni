import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, createSelector, State, StateContext, Store } from "@ngxs/store";
import { throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { AuthState } from "../auth/auth.state";
import { EstablishmentsRow, Mapper, Table } from "../data/data.model";
import { Clear, GetCompanies } from "./misc.actions";

@State<{ [key: string]: Table }>({
  name: 'misc',
  defaults: {}
})
@Injectable()
export class MiscState {
  static get(field: string) {
    return createSelector([MiscState], (state: any) => {
      console.log(state[field]);
      return state[field] || [];
    });
  }

  constructor(private store: Store, private http: HttpClient) {}

  @Action(GetCompanies)
  geCompanies(ctx: StateContext<any>, action: GetCompanies) {
    const req = this.http.get(environment.backUrl + `/initialize/?action=${action.action}&subName=${action.subname}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return req.pipe(
      catchError((err: HttpErrorResponse) => {
        return throwError(err);
      }),
      tap((response: any) => {
        console.log('$', response)
        if ( !response ) return;
        //EstablishmentsRow.instances.clear();
        Mapper.mapTable(response, "Establishments", false);
        //clear and reset company descriptor
        ctx.setState({...ctx.getState(), [action.storeId]: [...EstablishmentsRow.instances.values()].map(row => row.serialize()) });
      })
    );
  }

  @Action(Clear)
  clear(ctx: StateContext<any>) {
    //clear company descriptor
  }
};