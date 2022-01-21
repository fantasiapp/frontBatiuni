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

  constructor(private store: Store, private http: HttpClient) {
  }

  @Action(ChangeProfileType)
  changeProfileType(ctx: StateContext<User>, action: ChangeProfileType) {
    return ctx.patchState({ viewType: action.type });
  }

  @Action(ChangeProfilePicture)
  changeProfilePicture(ctx: StateContext<User>, action: ChangeProfilePicture) {
    let token = this.store.selectSnapshot(AuthState).token;
    console.log(action);

    let req = this.http.post(environment.backUrl + '/data/', action, {
      headers: {
        "Authorization": "Token " + token,
        'Content-Type': 'application/json'
      }
    });

    return req.pipe(
      tap(() => {
        ctx.patchState({ imageUrl: 'data:image/' + action.ext + ';base64,' + action.imageBase64 });
      })
    );
  }

  @Action(ChangePassword)
  modifyPassword(ctx: StateContext<User>, action: ChangePassword) {
    console.log(this.store.selectSnapshot(AuthState));
    let token = this.store.selectSnapshot(AuthState).token;
    let req = this.http.post(environment.backUrl + '/data/', action, {
      headers: {
        Authorization: "Token " + token,
        'Content-Type': 'application/json'
      }
    })

    return req.pipe(
      tap((response: any) => console.log(response))
    );
  }

  @Action(GetImage)
  getImage(ctx: StateContext<User>, action: GetImage) {
    const { token } = this.store.selectSnapshot(AuthState);

    console.log(action);
    
    let req = this.http.get(environment.backUrl + `/data/?action=${action.action}&id=${action.id}`, {
      headers: {
        "Authorization": `Token ${token}`,
        'Content-Type': 'application/json'
      }
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
        console.log(ctx.getState().imageUrl?.length)
      })
    )
  }

  @Action(UploadFile)
  uploadFile(ctx: StateContext<User>, action: UploadFile) {
    const { token } = this.store.selectSnapshot(AuthState);

    console.log(action);
    
    let req = this.http.post(environment.backUrl + '/data/', action, {
      headers: {
        "Authorization": `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });

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
    const { token } = this.store.selectSnapshot(AuthState);

    console.log(action);
    
    let req = this.http.post(environment.backUrl + '/data/', action, {
      headers: {
        "Authorization": `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });

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
    let { token } = action;
    let req = this.http.get(environment.backUrl + '/data/?action=getUserData', {
      headers: {
        "Authorization": `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });


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

        console.log(currentUser.company.files);
        console.log(ctx.getState());
        if ( !ctx.getState().imageUrl ) {
          const reversed = currentUser.company.files.slice(); reversed.reverse();
          const newestImage = reversed.find((file) => file.nature == 'userImage');
          if ( newestImage ) this.store.dispatch(new GetImage(newestImage.id));
        }
        //let avatar: Avatar | null = null;
        //if ( avatar = Avatar.getById(1)! ) partial.imageUrl = 'data:image/' + avatar.ext + ';base64,' + avatar.content;
        ctx.patchState(partial);
        console.log(ctx.getState().imageUrl?.length)
      })
    )
  }

  @Action(Logout)
  logout(ctx: StateContext<User>) {
    ctx.patchState({ imageUrl: null, profile: null });
  }

  @Action(ModifyUserProfile)
  modifyUser(ctx: StateContext<User>, action: ModifyUserProfile) {
    let { token } = this.store.selectSnapshot(AuthState);

    const {files, ...modifyAction} = action;
    let req = this.http.post(environment.backUrl + '/data/', modifyAction, {
      headers: {
        "Authorization": `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });

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