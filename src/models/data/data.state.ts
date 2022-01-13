import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, State, StateContext, Store } from "@ngxs/store";
import { of, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { GetGeneralData } from "./data.actions";
import { Mapper } from "./mapper.model";

@State({
  name: 'data',
  defaults: {}
})
@Injectable()
export class DataState {

  constructor(private store: Store, private http: HttpClient) {}

  @Action(GetGeneralData)
  getGeneralData(ctx: StateContext<any>, action: GetGeneralData) {    
    //eventually make a local storage service
    let generalData = localStorage.getItem('general-data'), req;
    req = generalData ? of(JSON.parse(generalData)) : this.http.get(environment.backUrl + "/initialize/?action=getGeneralData",  {
      headers: { 'Content-Type': 'application/json' }
    });

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
};