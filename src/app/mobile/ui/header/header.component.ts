import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { Store } from "@ngxs/store";
import { ChangeProfileType } from "src/models/new/user/user.actions";

@Component({
  selector: 'page-header',
  template: `
  <header class="clear-margin flex column full-width small-space-children-margin">
    <div class="switch-header__wrapper">
      <div class="switch-header">
        <div class="switch-header__PME-ST" (click)="changeProfileType(true)">
          Profil PME
        </div>
        <div class="switch-header__PME-ST active" (click)="changeProfileType(false)">
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


  @Input()
  name: string = '';

  //ngFor uses collections
  makeArray(tabs: number) {
    let result = new Array(tabs);
    for ( let i = 0; i < tabs; i++ )
      result[i] = i;
    return result;
  }

  constructor(private store: Store){
    
  }

  changeProfileType(type: boolean) {
    this.store.dispatch(new ChangeProfileType(type));
  }
};