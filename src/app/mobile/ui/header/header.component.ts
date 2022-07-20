import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { Router } from "@angular/router";
import { MyStore } from "src/app/shared/common/classes";
import { Select } from "@ngxs/store";
import { Observable } from "rxjs/internal/Observable";
import { InfoService } from "src/app/shared/components/info/info.component";
import { NavService } from "src/app/shared/components/navigation/navigation.component";
import { Company, Profile, User } from "src/models/new/data.interfaces";
import { DataQueries, DataState } from "src/models/new/data.state";
import { ChangeProfileType } from "src/models/new/user/user.actions";

@Component({
  selector: 'page-header',
  template: `
  <header class="clear-margin flex column full-width small-space-children-margin" [ngClass]="{'header-search-with-switch': profile.company && profile.company.role == 3}">
    <div class="switch-header__wrapper" *ngIf="profile.company && profile.company.role == 3">
      <div class="switch-header">
        <div class="switch-header__PME-ST" [ngClass]="{'active': isPmeSwitch}" (click)="changeProfileType(true)">
          Profil PME
        </div>
        <div class="switch-header__PME-ST" [ngClass]="{'active': !isPmeSwitch}" (click)="changeProfileType(false)">
          Profil Sous-traitant
        </div>
      </div>
    </div>
    <h1 *ngIf="!customHeader">{{name}}</h1>
    <div *ngIf="!customHeader; else headerBar" class="pick flex row">
      <searchbar class="grow" [callbackSearch]="callbackSearch"></searchbar>
      <img [src]="filterOpen ? 'assets/filterBlue.svg':'assets/filterWhite.svg'" (click)="filterClicked.emit()"/>
    </div>
    <ng-template #headerBar>
      <ng-content select="[headerBar]"></ng-content>
    </ng-template>
    <ul class="tabs flex row full-width font-Poppins" [class.three_tabs]="tabs == 3">
      <li class="center-text" [class.active]="activeView == 0" (click)="activeViewChange.emit(activeView = 0)" ><ng-content select="[tab_0]"></ng-content></li>
      <li class="center-text" [class.active]="activeView == 1" (click)="activeViewChange.emit(activeView = 1)" ><ng-content select="[tab_1]"></ng-content></li>
      <li *ngIf="tabs > 2" class="center-text" [class.active]="activeView == 2" (click)="activeViewChange.emit(activeView = 2)" ><ng-content select="[tab_2]"></ng-content></li>
    </ul>
  </header>
  `,
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  openFilterMenu: boolean = false;

  @Input() profile!: Profile
  
  @Input()
  activeView: number = 0;

  @Output()
  activeViewChange = new EventEmitter<number>();

  @Input()
  tabs: 2 | 3 = 2;
  
  @Input()
  customHeader: boolean = false;

  @Input()
  filterOpen: boolean = false;

  @Input()
  callbackSearch: Function = () => {};

  @Output()
  filterClicked = new EventEmitter<never>();

  @Select(DataState.view)
  view$!: Observable<'ST' | 'PME'>;

  // @Select(DataState.users) 
  // user$!: Observable<User>
  // company!: Company
  @Input()
  name: string = '';

  //ngFor uses collections
  makeArray(tabs: number) {
    let result = new Array(tabs);
    for ( let i = 0; i < tabs; i++ )
      result[i] = i;
    return result;
  }

  constructor(private store: MyStore, private router: Router, private navService: NavService, private info: InfoService){
    
  }

  ngOnInit(){
    if(this.profile.company && this.profile.company.role == 3){
      this.info.alignWith('header_search_switch')
      console.log('info switch');
    } else {
      this.info.alignWith('header_search')
    }
    console.log('profile', this.profile);
    this.view$.subscribe((view)=>{
      this.isPmeSwitch = view === 'PME'
    })
    // this.user$.subscribe((user) => {
    //   console.log('company', user, user.company);
    //   this.company = this.store.selectSnapshot(DataQueries.getById('Company', user.company))!
    // })
  }

  isPmeSwitch: boolean = false
  changeProfileType(type: boolean) {
    this.isPmeSwitch = type
    this.store.dispatch(new ChangeProfileType(type)).subscribe(()=> {
      try{ 
        this.navService.updateNav(0)
      } catch {

      }
    })
  }
};