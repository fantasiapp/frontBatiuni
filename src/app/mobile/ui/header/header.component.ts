import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'page-header',
  template: `
  <header class="clear-margin flex column full-width small-space-children-margin">
    <h1 *ngIf="!customHeader">{{name}}</h1>
    <div *ngIf="!customHeader; else headerBar" class="pick flex row">
      <searchbar class="grow"></searchbar>
      <img [src]="filterOpen ? 'assets/filterBlue.svg':'assets/filterWhite.svg'" (click)="filterClicked.emit(); filterOpen = true;" id ='filterButton'/>
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
};