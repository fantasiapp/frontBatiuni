import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, State, StateContext, Store } from "@ngxs/store";
import { of, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { HttpService } from "src/app/services/http.service";
import {GetGeneralData } from "./data.actions";
import { DetailedPostRow, Mapper, PostRow } from "./data.model";

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
};