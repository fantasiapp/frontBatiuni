import { Component, ChangeDetectionStrategy, SimpleChange, SimpleChanges, ChangeDetectorRef } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Select, Store } from "@ngxs/store";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { DistanceSliderConfig, SalarySliderConfig } from "src/app/shared/common/config";
import { b64toBlob, filterSplit } from "src/app/shared/common/functions";
import { Serialized } from "src/app/shared/common/types";
import { InfoService } from "src/app/shared/components/info/info.component";
import { Company, FilesRow, Post, PostRow, UserProfileRow } from "src/models/data/data.model";
import { DataState } from "src/models/data/data.state";
import { DeletePost, DuplicatePost, SwitchPostType } from "src/models/user/user.actions";
import { User } from "src/models/user/user.model";
import { UserState } from "src/models/user/user.state";
import * as UserActions from "src/models/user/user.actions";

type PostMenu = { open: boolean; post: Post | null; };

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent extends Destroy$ {
  
  @Select(UserState)
  user$!: Observable<User>;

  @Select(DataState.get('posts'))
  posts$!: Observable<Post[]>;

  constructor(private store: Store, private sanitizer: DomSanitizer,private info: InfoService,private cd: ChangeDetectorRef) {
    super()
  }

  userPosts: Post[] = [];
  userDrafts: Post[] = [];
  userOnlinePosts: Post[] = [];
  allOnlinePosts: [Post, Company][] = [];
  openReponseMenu : boolean = false;
  validerCandidature: boolean = false
  
  ngOnInit() {
    combineLatest([this.user$, this.posts$]).pipe(takeUntil(this.destroy$)).subscribe(([user, posts]) => {
      this.userPosts = user.profile?.company.posts || [];
      [this.userOnlinePosts, this.userDrafts] = filterSplit(this.userPosts, post => !post.draft);
      
      this.allOnlinePosts = posts.filter(post => !post.draft).map(post => [post, PostRow.getCompany(post)] as [Post, Company])
        .filter(([post, company]) => company.id != user.profile!.company.id);
    });
  }
  
  activeView: number = 0;
  annonces = new Array(10);

  openAdFilterMenu: boolean = false;

  imports = { DistanceSliderConfig, SalarySliderConfig };

  editMenu: PostMenu = { open: false, post: null };

  checkMenu: PostMenu & { swipeup: boolean; } = { open: false, post: null, swipeup: false }

  openPost(post: Post) {
    console.log('setting post', post);
    this.editMenu = { open: true, post };
  }

  checkPost(post: Post) {
    this.checkMenu = { open: true, post, swipeup: false };
  }

  checkPostMenu() {
    this.checkMenu.swipeup = true;
  }

  duplicatePost(id: number) {
    this.store.dispatch(new DuplicatePost(id)).pipe(take(1)).subscribe(() => {
      this.checkMenu = {open: false, post: null, swipeup: false};
    }, () => {
      console.log('duplication error')
      this.info.show("error", "Erreur lors de la duplication de l'annonce");
    });
  }

  switchDraft(id: number) {
    this.store.dispatch(new SwitchPostType(id)).pipe(take(1)).subscribe(() => {
      this.checkMenu = {open: false, post: null, swipeup: false};
    }, () => {
      this.info.show("error", "Echec");
    });
  }

  deletePost(id: number) {
    this.store.dispatch(new DeletePost(id)).pipe(take(1)).subscribe(() => {
      this.checkMenu = {open: false, post: null, swipeup: false};
    }, () => {
      this.info.show("error", 'Echec de suppression..');
    });
  }
  fileView: any = {
    _open: false,
    get open() { return this._open; },
    set open(v) { if (!v) {this.url = null;} this._open = v; },
    url: null,
    safeUrl: null,
    type: '',
    image: null
  };
  openFile(filename: string) {
    const user = this.store.selectSnapshot(UserState).profile as Serialized<UserProfileRow>,
      companyFiles = user.company.files,
      target = companyFiles.find(file => file.name == filename);
  
    if ( !target ) throw `file ${filename} doesn't exist on the current company`;
    const content = target.content ? of(target.content) : this.store.dispatch(new UserActions.DownloadFile(target.id));
    this.info.show('info', 'Téléchargement du fichier', Infinity);

    content.pipe(take(1)).subscribe(() => {
      const updatedFile = FilesRow.getById(target.id),
        type = FilesRow.getFileType(updatedFile.ext);
                  
      const blob = b64toBlob(updatedFile.content, type),
        url = URL.createObjectURL(blob);
      
      this.fileView.image = type.startsWith('image') || false;
      this.fileView.url = url;
      this.fileView.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.fileView.type = type;
      this.fileView.open = true;
      this.info.show('success', 'Fichier téléchargé', 2000);
      this.cd.markForCheck();
    });

    this.cd.markForCheck();
  }
  get attachedFiles(): any[] {
    const user = this.store.selectSnapshot(UserState).profile as Serialized<UserProfileRow>;
    return user.company.files.filter(file => file.nature == 'admin' || file.nature == 'labels');
  }
  getFileColor(filename: string) {
    return FilesRow.getFileColor(filename);
  }
};