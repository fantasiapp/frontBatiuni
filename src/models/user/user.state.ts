import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, Select, Selector, State, StateContext, Store } from "@ngxs/store";
import { catchError, concatMap, map, mergeMap, take, tap } from "rxjs/operators";
import { ChangePassword, ChangeProfileType, ChangeProfilePicture, GetUserData, ModifyUserProfile, UploadFile, DownloadFile, UploadPost, DeletePost, DuplicatePost, SwitchPostType } from "./user.actions";
import { User } from "./user.model";
import { Logout } from "../auth/auth.actions";
import { of, throwError } from "rxjs";
import { CompanyRow, DetailedPostRow, FilesRow, Mapper, PostRow, UserProfileRow } from "../data/data.model";
import { HttpService } from "src/app/services/http.service";
import { StoreData } from "../data/data.actions";

@State<User>({
  name: 'user',
  defaults: new User
})
@Injectable()
export class UserState {
  //Selectors
  @Selector()
  static type(state: User) { return state.viewType; }

  @Selector()
  static profile(state: User) { return state.profile; }


  constructor(private store: Store, private http: HttpService) {}

  //Action handlers
  @Action(ChangeProfileType)
  changeProfileType(ctx: StateContext<User>, action: ChangeProfileType) {
    return ctx.patchState({ viewType: action.type });
  }

  @Action(ChangeProfilePicture)
  changeProfilePicture(ctx: StateContext<User>, action: ChangeProfilePicture) {
    return  this.http.post('data', action).pipe(
      tap(() => {
        ctx.patchState({ imageUrl: 'data:image/' + action.ext + ';base64,' + action.imageBase64 });
      })
    );
  }

  @Action(ChangePassword)
  modifyPassword(ctx: StateContext<User>, action: ChangePassword) {
    return this.http.post('data', action).pipe(
      tap((response: any) => {
        console.log(response);
        if ( response[action.action] != 'OK' ) throw response['messages'];
      })
    );
  }


  @Action(UploadFile)
  uploadFile(ctx: StateContext<User>, action: UploadFile) {
    const req = this.http.post('data', action),
      user = ctx.getState();

    return req.pipe(
      catchError((err: HttpErrorResponse) => {
        return throwError(err);
      }),
      tap((response: any) => {
        if ( response['uploadFile'] !== 'OK' ) throw response['messages'];
        delete response['uploadFile'];
        // add to cached files
        const id = +Object.keys(response)[0];
        const file = new FilesRow(id, [...response[id], action.fileBase64]);
        //add to company
        CompanyRow.getById(user.profile!.company.id).pushValue('Files', file);

        //find a way to make minimal updates with a tree-like-structure
        ctx.patchState({profile: UserProfileRow.getById(user.profile!.id).serialize()});
      })
    );
  }

  @Action(DownloadFile)
  downloadFile(ctx: StateContext<User>, action: DownloadFile) {
    const req = this.http.get('data', action),
      user = ctx.getState();

    return req.pipe(
      catchError((err: HttpErrorResponse) => {
        return throwError(err);
      }),
      tap((response: any) => {
        if ( response['dataPost'] !== 'Error' ) throw response['messages'];
        const file = new FilesRow(action.id, response[action.id]),
          profile = UserProfileRow.getById(user.profile!.id),
          index = profile.company.files.findIndex(file => file.id == action.id);
        
        if ( index < 0 ) throw 'File id conflict.';
        
        profile.company.files.splice(index, 1, file);
        ctx.patchState({profile: UserProfileRow.getById(user.profile!.id).serialize()})
        console.log(ctx.getState().profile!.company.files);
        //add to company
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
          this.store.dispatch(new StoreData('posts', PostRow, {type: 'load', id: 0}));
        } catch ( err ) {
          console.warn(err);
          this.store.dispatch(new Logout());
          return;
        };
        
        const currentUser = [...UserProfileRow.instances.values()][0],
          partial: any = { profile: currentUser.serialize() };

        console.log('current User', currentUser.serialize());
        ctx.patchState(partial);
        if ( !ctx.getState().imageUrl ) {
          const reversed = currentUser.company.files.slice(); reversed.reverse();
          const newestImage = reversed.find((file) => file.nature == 'userImage');
          if ( newestImage ) this.store.dispatch(new DownloadFile(newestImage.id))
            .pipe(take(1)).subscribe( () => {
              const imageFile = FilesRow.getById(newestImage.id);
              ctx.patchState({
                imageUrl: `data:image/${imageFile.ext};base64,${imageFile.content}`
              });
            }, err => throwError(err));
        }
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

    console.log(Object.keys(action.adminFiles));

    return req.pipe(
      tap((response: any) => {
        const newProfile = Mapper.updateFrom(UserProfileRow, ctx.getState().profile, response.valueModified);
        ctx.patchState({profile: newProfile})
      }),
      
      mergeMap(() => ctx.dispatch(
        action.files.map(file => new UploadFile(file, 'labels'))
      )),

      mergeMap(() => ctx.dispatch(
        Object.keys(action.adminFiles).map(key => new UploadFile(action.adminFiles[key], 'admin', key))
      ))
    );
  }

  @Action(UploadPost)
  createPost(ctx: StateContext<User>, action: UploadPost) {
    const {profile} = ctx.getState(),
      {files, ...createPost} = action,
      req = this.http.post('data', createPost),
      uploads = Object.keys(files).map((key: any) => new UploadFile(files[key], 'post', key));
    
    return req.pipe(
      map((response: any) => {
        console.log('>', response);
        if ( response[action.action] && response[action.action] !== 'OK' )
          throw response['messages'];

        delete response[action.action];
        const id = +Object.keys(response)[0],
          detailsIndex = PostRow.fields.get('DetailedPost')!,
          details = response[id][detailsIndex],
          mappedDetails = Object.entries<any[]>(details).map(([id, details]) => {
            return new DetailedPostRow(+id, details);
          });
          
        response[id][detailsIndex] = mappedDetails;
        let post = new PostRow(id, response[id]);
        this.store.dispatch(new StoreData('posts', PostRow, {type: 'add', id: post.id}));
        return post;
      }),
      concatMap((post: PostRow) => {
        const userProfileData = UserProfileRow.getById(profile!.id),
          userCompanyData = userProfileData.company;

        userCompanyData.pushValue('Post', post);

        uploads.forEach(upload => {
          upload.Post = post.id;
        });

        return ctx.dispatch(uploads)
      }),
      concatMap(() => {
        ctx.patchState({profile: UserProfileRow.getById(profile!.id).serialize()});
        return of(true);
      })
    );
  };

  @Action(DuplicatePost)
  duplicatePost(ctx: StateContext<User>, action: DuplicatePost) {
    const {profile} = ctx.getState();

    return this.http.get('data', action).pipe(
      tap((response: any) => {
        if ( response['duplicatePost'] !== 'OK' )
          throw response['messages'];
        
        delete response['duplicatePost'];
        const id = +Object.keys(response)[0],
          post = new PostRow(id, response[id]);
        
        this.store.dispatch(new StoreData('posts', PostRow, {type: 'add', id: post.id}));
        ctx.patchState({profile: UserProfileRow.getById(profile!.id).serialize()});
      })
    );
  }

  @Action(SwitchPostType)
  switchPostType(ctx: StateContext<User>, action: SwitchPostType) {
    const {profile} = ctx.getState();
    return this.http.get('data', action).pipe(
      tap((response: any) => {
        console.log(response);
        if ( response['switchDraft'] !== 'OK' )
          throw response['messages'];
        
        delete response['switchDraft'];
        const post = PostRow.getById(action.id);
        post.setField('draft', !post.getField('draft'));
        this.store.dispatch(new StoreData('posts', PostRow, {type: 'modify', id: post.id}));
                
        ctx.patchState({profile: UserProfileRow.getById(profile!.id).serialize()});
      })
    );
  };

  @Action(DeletePost)
  deletePost(ctx: StateContext<User>, action: DeletePost) {
    const {profile} = ctx.getState();

    return this.http.get('data', action).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(err);
        return throwError(err);
      }),
      tap((response: any) => {
        console.log(response);
        if ( response['deletePost'] !== 'OK' ) throw response['messages'];
        delete response['deletePost'];
        const ids = Object.keys(response);
        ids.forEach(id => {
          const post = PostRow.getById(+id),
            details = post.details;

          details.forEach(detail => DetailedPostRow.destroy(detail.id));
          PostRow.destroy(post.id);
          this.store.dispatch(new StoreData('posts', PostRow, {type: 'delete', id: post.id}));

          const userProfileData = UserProfileRow.getById(profile!.id),
            userCompanyData = userProfileData.company;

          userCompanyData.removeValue('Post', post.id);

          ctx.patchState({profile: userProfileData.serialize()})
        });
      })
    )
  }
};