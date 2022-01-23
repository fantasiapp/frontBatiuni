import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { catchError, mergeMap, tap } from "rxjs/operators";
import { AuthState } from "src/models/auth/auth.state";
import { environment } from "src/environments/environment";
import { ChangePassword, ChangeProfileType, ChangeProfilePicture, GetUserData, ModifyUserProfile, GetImage, UploadFile, DownloadFile } from "./user.actions";
import { User } from "./user.model";
import { Login, Logout } from "../auth/auth.actions";
import { of, throwError } from "rxjs";
import { Mapper } from "../data/mapper.model";
import { FilesRow, UserProfileRow } from "../data/data.model";
import { AppState } from "src/app/app.state";
import { HttpService } from "src/app/services/http.service";

@State<User>({
  name: 'user',
  defaults: new User
})
@Injectable()
export class UserState {
  @Selector()
  static type(state: User) { return state.viewType; }

  @Selector()
  static profile(state: User) { return state.profile; }

  constructor(private store: Store, private http: HttpService) {}

  @Action(ChangeProfileType)
  changeProfileType(ctx: StateContext<User>, action: ChangeProfileType) {
    return ctx.patchState({ viewType: action.type });
  }

  @Action(ChangeProfilePicture)
  changeProfilePicture(ctx: StateContext<User>, action: ChangeProfilePicture) {
    this.http.post('data', action).pipe(
      tap(() => {
        ctx.patchState({ imageUrl: 'data:image/' + action.ext + ';base64,' + action.imageBase64 });
      })
    );
  }

  @Action(ChangePassword)
  modifyPassword(ctx: StateContext<User>, action: ChangePassword) {
    return this.http.post('data', action).pipe(
      tap((response: any) => console.log(response))
    );
  }

  @Action(GetImage)
  getImage(ctx: StateContext<User>, action: GetImage) {
    
    const req = this.http.get('data', {
      action: action.action,
      id: action.id
    });

    return req.pipe(
      catchError((err: HttpErrorResponse) => {
        this.store.dispatch(new Logout());
        return throwError(err);
      }),
      tap((response: any) => {
        const file = FilesRow.getById(action.id),
          updates = response[action.id];
        
        file.read(updates);
        ctx.patchState({imageUrl: `data:image/${file.ext};base64,${file.content}`})
      })
    )
  }

  @Action(UploadFile)
  uploadFile(ctx: StateContext<User>, action: UploadFile) {
    const req = this.http.post('data', action);

    return req.pipe(
      catchError((err: HttpErrorResponse) => {
        return throwError(err);
      }),
      tap((response: any) => {
        //add new file locally
      })
    );
  }

  @Action(DownloadFile)
  downloadFile(ctx: StateContext<User>, action: DownloadFile) {
    const req = this.http.post('data', action);

    return req.pipe(
      catchError((err: HttpErrorResponse) => {
        return throwError(err);
      }),
      tap((response: any) => {
        //add new file locally
      })
    );
  }

  @Action(GetUserData)
  getUserData(ctx: StateContext<User>, action: GetUserData) {
    const req = this.http.get('data', { action: action.action })

    return req.pipe(
      catchError((err: HttpErrorResponse) => {
        this.store.dispatch(new Logout());
        return throwError(err);
      }),
      tap((response: any) => {
        try {
          Mapper.mapRequest(response);
        } catch ( err ) {
          this.store.dispatch(new Logout());
          return;
        };
        
        const currentUser = [...UserProfileRow.instances.values()][0],
          partial: any = { profile: currentUser.serialize(), viewType: currentUser.role.id == 2 };

        if ( !ctx.getState().imageUrl ) {
          const reversed = currentUser.company.files.slice(); reversed.reverse();
          const newestImage = reversed.find((file) => file.nature == 'userImage');
          if ( newestImage ) this.store.dispatch(new GetImage(newestImage.id));
        }
        ctx.patchState(partial);
      })
    )
  }

  @Action(Logout)
  logout(ctx: StateContext<User>) {
    ctx.patchState({ imageUrl: null, profile: null });
  }

  @Action(ModifyUserProfile)
  modifyUser(ctx: StateContext<User>, action: ModifyUserProfile) {
    const {files, ...modifyAction} = action;
    const req = this.http.post('data', modifyAction);

    return req.pipe(
      tap((response: any) => {
        const newProfile = Mapper.updateFrom(UserProfileRow, ctx.getState().profile, response.valueModified);
        ctx.patchState({profile: newProfile})
      }),
      

      mergeMap(() => ctx.dispatch(
        action.files.map(file => new UploadFile(file, 'label'))
      ))
    );
  }
};