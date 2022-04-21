import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Post, Profile } from 'src/models/new/data.interfaces';
import { DataQueries, QueryAll } from 'src/models/new/data.state';
import { Destroy$ } from "src/app/shared/common/classes";

@Component({
  selector: 'applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent extends Destroy$ implements OnInit {

  @Select(DataQueries.currentProfile)
  profile$!: Observable<Profile>;

  @QueryAll('Post')
  posts$!: Observable<Post[]>;
  
  constructor() { 
    super()
  }

  allOnlinePosts: Post[] = [];

  ngOnInit(): void {
    combineLatest([this.profile$, this.posts$]).pipe(takeUntil(this.destroy$)).subscribe(([profile, posts]) => {
      const mapping = splitByOutput(posts, (post) => {
        //0 -> userOnlinePosts | 1 -> userDrafts
        if ( profile.company.posts.includes(post.id) )
          return post.draft ? this.symbols.userDraft : this.symbols.userOnlinePost; 
        
        return post.draft ? this.symbols.discard : this.symbols.otherOnlinePost;
      });

      const otherOnlinePost = (mapping.get(this.symbols.otherOnlinePost) || []);
      this.userDrafts = mapping.get(this.symbols.userDraft) || [];
      this.userOnlinePosts = mapping.get(this.symbols.userOnlinePost) || [];
      this.allOnlinePosts = [...otherOnlinePost, ...this.userOnlinePosts];
      this.missions = this.store.selectSnapshot(DataQueries.getMany('Mission', profile.company.missions));
      this.cd.markForCheck();
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
