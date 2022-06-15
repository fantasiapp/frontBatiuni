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
import { delay, assignCopy, splitByOutput } from "../../../shared/common/functions";
import { MarkViewed, UnapplyPost } from "src/models/new/user/user.actions";
import { UIAnnonceResume } from "src/app/mobile/ui/annonce-resume/annonce-resume.ui";
import { Input } from "hammerjs";
import { getLevenshteinDistance } from "src/app/shared/services/levenshtein";
import { AppComponent } from "src/app/app.component";
import { InfoService } from "src/app/shared/components/info/info.component";
import { SearchbarComponent } from "src/app/shared/components/searchbar/searchbar.component";
import { SlidemenuService, UISlideMenuComponent } from "src/app/shared/components/slidemenu/slidemenu.component";

// import { UISlideMenuComponent } from 'src/app/shared/components/slidemenu/slidemenu.component';

@Component({
  selector: "applications",
  templateUrl: "./applications.component.html",
  styleUrls: ["./applications.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsComponent extends Destroy$ {
  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  @QueryAll("Post")
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

  userOnlinePosts: Post[] = [];
  allOnlinePosts: Post[] = [];
  allCandidatedPost: Post[] = [];
  filterOn: boolean = false;
  time: number = 0;
  searchbar!: SearchbarComponent;

  constructor(private cd: ChangeDetectorRef, private info: InfoService, private store: Store, private appComponent: AppComponent, private slideService: SlidemenuService,) {
    super();
    this.searchbar = new SearchbarComponent(store);
  }

  ngOnInit(): void {
    this.info.alignWith('header_search');
    combineLatest([this.profile$, this.posts$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([profile, posts]) => {
        console.log("DEBUT DE NGONINT")
      const mapping = splitByOutput(posts, (post) => {
          //0 -> userOnlinePosts | 1 -> userDrafts
          if (profile.company.posts.includes(post.id)){
            return post.draft ? this.symbols.userDraft : this.symbols.userOnlinePost;
          }
          return post.draft ? this.symbols.discard : this.symbols.otherOnlinePost;
        });
        const otherOnlinePost = mapping.get(this.symbols.otherOnlinePost) || [];
        this.allOnlinePosts = [...otherOnlinePost, ...this.userOnlinePosts];

      });
    this.time = this.store.selectSnapshot(DataState.time);

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
    this.cd.markForCheck;
    this.selectPost(null);
    this.selectSearch('');
    this.cd.markForCheck()
  }

  ngAfterViewInit() {
    this.cd.markForCheck;
  }

  selectPost(filter: any) {
    this.userOnlinePosts = [];
    if (filter == null) {  
      this.userOnlinePosts = this.allCandidatedPost;
    } else {
      // Trie les posts selon leur distance de levenshtein
      let levenshteinDist: any = [];
      if (filter.address) {
        for (let post of this.allCandidatedPost) {levenshteinDist.push([post,getLevenshteinDistance(post.address.toLowerCase(),filter.address.toLowerCase()),]);}
        levenshteinDist.sort((a: any, b: any) => a[1] - b[1]);
        let keys = levenshteinDist.map((key: any) => {return key[0];});
        this.allCandidatedPost.sort((a: any,b: any)=>keys.indexOf(a) - keys.indexOf(b));
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
    this.isFilterOn(filter);
  };

  isFilterOn(filter: any){
    if (filter.address == "" && filter.jobs.length == 0 && filter.manPower == null && filter.missionDate == "" && filter.postulationDate == "" && filter.sortMissionDate == false && filter.sortPostDate == false){
      this.filterOn = false;
    } else {
      this.filterOn = true;
      this.info.show("info","Vos filtres ont été appliqués", 3000);
    }
  }

  selectSearch(searchForm:  string){
    this.userOnlinePosts = [];
    if (searchForm == "" || searchForm == null)  {
      this.userOnlinePosts = this.allCandidatedPost
    } else {
      let levenshteinDist: any = [];
      for (let post of this.allCandidatedPost) {
        let postString = this.searchbar.postToString(post)
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
    this.cd.markForCheck;    
  }

  ngOnDestroy(): void {
    this.info.alignWith("last");
    super.ngOnDestroy();
  }

  isRefused(onlinePost: Post | null) {
    const profile = this.store.selectSnapshot(DataQueries.currentProfile);
    return onlinePost?.candidates.some((id) => {
      let candidate = this.store.selectSnapshot(DataQueries.getById("Candidate", id));
      return candidate!.company == profile.company.id && candidate!.isRefused;
    });
  }

  updatePage() {
    this.cd.markForCheck()
  }

  @ViewChild("slideOnlinePost") private slideOnlinePost!: UISlideMenuComponent;

  @ViewChild(UIAnnonceResume, { static: false }) private annonceResume!: UIAnnonceResume;

  slideOnlinePostClose() {
    this.updatePage()
    // Close View
    this.slideOnlinePost.close();

    // Update
    this.annonceResume.close();
  }

  deleteCandidate(id: number){
    const profile = this.store.selectSnapshot(DataQueries.currentProfile);
    let post = this.userOnlinePosts.filter(post => post.id == id)[0]
    const candidateCompany = (candidateId: number) =>{
      return this.store.selectSnapshot(DataQueries.getById("Candidate", candidateId))?.company
    }
    let candidate = post.candidates.filter(candidateId => candidateCompany(candidateId) == profile.company.id)[0]
    this.store.dispatch(new UnapplyPost(id, candidate))
    this.userOnlinePosts = this.userOnlinePosts.filter(post => post.id != id)
    // this.allCandidatedPost = this.userOnlinePosts
    this.slideOnlinePostClose()
    this.cd.markForCheck();    
  }

  
}
