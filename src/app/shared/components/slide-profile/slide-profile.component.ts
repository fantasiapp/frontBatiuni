import { Component, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { Company, Post, Profile, User } from 'src/models/new/data.interfaces';
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

  @Input("isSuiviPME")
  isSuiviPME: boolean = false

  @Input()
  view: 'ST' | 'PME' | null = 'PME'

  openRatings: boolean = false;
  user!: User;

  subContractor: Company | null = null;
  
  constructor(private store: Store) {
    super();
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",this.post)
    
  }
  
  ngOnInit(){
    let fakeUser: User = {
      id: -1,
      email: '',
      username: '',
      company: this.profile.company.id,
      firstName: '',
      lastName: this.isSuiviPME ? this.post.subContractorName : this.post.contactName,
      proposer: '',
      cellPhone: '',
      function: '',
      tokenFriend: '',
      favoritePosts: [],
      viewedPosts: []
    }
    console.log("bbbbbbbbbbbbbbbbbbbbbb", fakeUser)
    this.profile.user = fakeUser
  }

  ngOnChanges(){
    
  }

  set open(value: boolean) {   
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",this.post)
    this.openSlideProfile = value
    super.open = value   
  }
  
  close() {
    this.openSlideProfile = false
    this.openChange.emit(this.openSlideProfile)
  }
}
