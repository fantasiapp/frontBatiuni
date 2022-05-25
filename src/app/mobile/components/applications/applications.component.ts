import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { combineLatest, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Post, PostMenu, Profile } from "src/models/new/data.interfaces";
import { DataQueries, DataState, QueryAll } from "src/models/new/data.state";
import { Destroy$ } from "src/app/shared/common/classes";
import { assignCopy, splitByOutput } from "../../../shared/common/functions";
import { MarkViewed } from "src/models/new/user/user.actions";
import { UIAnnonceResume } from "src/app/mobile/ui/annonce-resume/annonce-resume.ui";
import { Input } from "hammerjs";
import { getLevenshteinDistance } from "src/app/shared/services/levenshtein";
import { AppComponent } from "src/app/app.component";
import { InfoService } from "src/app/shared/components/info/info.component";
import { SearchbarComponent } from "src/app/shared/components/searchbar/searchbar.component";
import { flatten } from "@angular/compiler";
import { getUserDataService } from "src/app/shared/services/getUserData.service";
// import { UISlideMenuComponent } from 'src/app/shared/components/slidemenu/slidemenu.component';

@Component({
  selector: "applications",
  templateUrl: "./applications.component.html",
  styleUrls: ["./applications.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsComponent extends Destroy$ {
  // @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  // @QueryAll("Post")
  posts$!: Observable<Post[]>;

  //split the set all of posts into these (what we need)
  private symbols = {
    userDraft: 0,
    userOnlinePost: 1,
    otherOnlinePost: 2,
    discard: -1,
  };


  openAdFilterMenu: boolean = false;

  postMenu = new PostMenu();
  hasCombined: boolean = false;
  userDrafts: Post[] = [];
  userOnlinePosts: Post[] = [];
  allOnlinePosts: Post[] = [];
  allCandidatedPost: Post[] = [];
  time: number = 0;
  searchbar!: SearchbarComponent;

  constructor(private cd: ChangeDetectorRef, private info: InfoService, private store: Store, private appComponent: AppComponent, private getUserDataService: getUserDataService) {
    super();
    this.searchbar = new SearchbarComponent(store);
    this.profile$ = store.select(DataQueries.currentProfile)
    this.posts$ = store.select(DataQueries.getAll("Post"))
  }

  ngOnInit(): void {

    this.getUserDataService.getDataChangeEmitter().subscribe((value) => {
      this.profile$ = this.store.select(DataQueries.currentProfile)
      this.posts$ = this.store.select(DataQueries.getAll("Post"))
      this.initAll()
    })

    this.info.alignWith('header_search');
    this.initAll()

  }

  ngAfterViewInit() {
  }

  initAll() {
    this.initCombinedLatest()
    this.time = this.store.selectSnapshot(DataState.time);
    this.initPost()
    
    this.cd.markForCheck;
    this.selectPost(null);
  }

  initCombinedLatest() {
    if(!this.hasCombined) {
      combineLatest([this.profile$, this.posts$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([profile, posts]) => {
        const mapping = splitByOutput(posts, (post) => {
          //0 -> userOnlinePosts | 1 -> userDrafts
          if (profile.company.posts.includes(post.id))
            return post.draft
              ? this.symbols.userDraft
              : this.symbols.userOnlinePost;

          return post.draft
            ? this.symbols.discard
            : this.symbols.otherOnlinePost;
        });

        const otherOnlinePost = mapping.get(this.symbols.otherOnlinePost) || [];
        this.userDrafts = mapping.get(this.symbols.userDraft) || [];
        this.userOnlinePosts = mapping.get(this.symbols.userOnlinePost) || [];
        this.allOnlinePosts = [...otherOnlinePost, ...this.userOnlinePosts];
      });}
  }

  initPost() {
    for (let post of this.allOnlinePosts){
      const profile = this.store.selectSnapshot(DataQueries.currentProfile);
      let companiesId;
      if (post) {
        companiesId = post.candidates?.map((id: number) => {
          let candidate = this.store.selectSnapshot(
            DataQueries.getById("Candidate", id)
         );
          return candidate!.company;
        });
      }
      if (companiesId?.includes(profile.company.id)) {
        this.allCandidatedPost.push(post)
      }
    }
  }

  selectPost(filter: any) {
    this.userOnlinePosts = [];
    if (filter == null) {  
      this.userOnlinePosts = this.allCandidatedPost;
    } else {
      // Array qui contiendra les posts et leur valeur en distance Levenshtein pour une adresse demandée
      let levenshteinDist: any = [];
      if (filter.address) {
        for (let post of this.allCandidatedPost) {levenshteinDist.push([post,getLevenshteinDistance(post.address.toLowerCase(),filter.address.toLowerCase()),]);}
        levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
        let keys = levenshteinDist.map((key: any) => {
          return key[0];
        });
        // Trie les posts selon leur distance de levenshtein
        this.allCandidatedPost.sort((a: any,b: any)=>keys.indexOf(a) - keys.indexOf(b));
      } else {
        this.allCandidatedPost.sort((a, b) => {
          return a["id"] - b["id"];
        });
      }

      // Trie les posts par date de mission la plus proche
      if (filter.sortPostDate === true) {this.allCandidatedPost.sort((a: any, b: any) => Date.parse(a['dueDate']) - Date.parse(b['dueDate']))}

      // Trie les posts par date de mission la plus proche
      if (filter.sortMissionDate === true) {this.allCandidatedPost.sort((a: any, b: any) => Date.parse(a['startDate']) - Date.parse(b['startDate']))}
    
      for (let post of this.allCandidatedPost) {

        let candidates = this.store.selectSnapshot(DataQueries.getMany("Candidate", post.candidates));
        const user = this.store.selectSnapshot(DataQueries.currentUser);
        let userCandidate = candidates.filter(candidate => candidate.company == user.company)
        let applicationDate = userCandidate.map(candidate => {return candidate.date})
        let isDifferentApplicationDate = (filter.postulationDate && applicationDate[0] != filter.postulationDate) 

        let isDifferentDate = (filter.missionDate && post.startDate < filter.missionDate)

        let isDifferentManPower = (filter.manPower && post.manPower != (filter.manPower === "true"))
        let isNotIncludedJob = (filter.jobs && filter.jobs.length && filter.jobs.every((job: any) => {return job.id != post.job}))

        if (isDifferentDate || isDifferentManPower || isNotIncludedJob || isDifferentApplicationDate) {
          continue;
        }
        this.userOnlinePosts.push(post);
      }
    }
    this.cd.markForCheck();
  }

  callbackFilter = (filter: any): void => {
    this.selectPost(filter);
  };

  selectSearch(searchForm:  string){
    this.userOnlinePosts = [];
    if (searchForm == "" || searchForm == null)  {
      this.userOnlinePosts = this.allCandidatedPost
    } else {
      let levenshteinDist: any = [];
      for (let post of this.allCandidatedPost) {
        let postString = this.searchbar.postToString(post)
        console.log(postString)
        levenshteinDist.push([post,getLevenshteinDistance(postString.toLowerCase(),searchForm.toLowerCase()),]);
      }
      levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
      let keys = levenshteinDist.map((key: any) => { return key[0]; });
      this.allCandidatedPost.sort((a: any,b: any)=>keys.indexOf(a) - keys.indexOf(b));
      this.userOnlinePosts = this.allCandidatedPost
    }
    this.cd.markForCheck();
  }

  callbackSearch = (search: any): void => {
    this.selectSearch(search)
  };

  openPost(post: Post | null) {
    //mark as viewed
    this.postMenu = assignCopy(this.postMenu, {
      post,
      open: !!post,
      swipeup: false,
    });
    if (post) this.store.dispatch(new MarkViewed(post.id));
    // setTimeout(() => {
    //   // this.annonceResume.open()
    // }, 20);
  }

  ngOnDestroy(): void {
    this.info.alignWith("last");
    super.ngOnDestroy();
  }

  slideOnlinePostClose() {
    this.postMenu.open = false;
    // Update
    this.annonceResume.close();
  }

  isRefused(onlinePost: Post) {
    const profile = this.store.selectSnapshot(DataQueries.currentProfile);
    return onlinePost.candidates.some((id) => {
      let candidate = this.store.selectSnapshot(DataQueries.getById("Candidate", id));
      return candidate!.company == profile.company.id && candidate!.isRefused;
    });
  }
  
  @ViewChild(UIAnnonceResume, { static: false })
  private annonceResume!: UIAnnonceResume;
}
