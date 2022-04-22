import { Component, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { Post, Profile, User } from 'src/models/new/data.interfaces';
import { DataQueries } from 'src/models/new/data.state';
import { UIOpenMenu } from '../../common/classes';

@Component({
  selector: 'slide-profile',
  templateUrl: './slide-profile.component.html',
  styleUrls: ['./slide-profile.component.scss']
})
export class SlideProfileComponent extends UIOpenMenu {

  openSlideProfile: boolean = false;
  
  // @Select(DataQueries.currentProfile)
  // profile$!: Observable<Profile>;
  // profile!: Profile;

  @Input()
  profile!: Profile;

  @Input()
  post!: Post;

  @Input()
  view: 'ST' | 'PME' | null = 'PME'

  openRatings: boolean = false;
  user!: User;
  
  constructor(private store: Store) {
    super();

    
  }
  
  ngOnInit(){
    let fakeUser: User = {
      id: -1,
      email: '',
      username: this.post.contactName,
      company: this.profile.company.id,
      firstName: '',
      lastName: '',
      proposer: '',
      cellPhone: '',
      function: '',
      favoritePosts: [],
      viewedPosts: []
    }
    this.profile.user = fakeUser
  }

  ngOnChanges(){
    
  }

  set open(value: boolean) {   
    this.openSlideProfile = value
    super.open = value   
  }
  
  close() {
    this.openSlideProfile = false
    this.openChange.emit(this.openSlideProfile)
  }
}
