import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'page-header',
  template: `
  <header class="clear-margin flex column full-width space-children-margin">
    <div *ngIf="!customHeader" class="text-light-emphasis">{{name}}</div>
    <div *ngIf="!customHeader; else headerBar" class="pick flex row">
      <searchbar class="grow"></searchbar>
      <img src="assets/Filtrer par.svg" (click)="filterClicked.emit()"/>
    </div>
    <ng-template #headerBar>
      <ng-content select="[headerBar]"></ng-content>
    </ng-template>
    <ul class="tabs flex row full-width font-Poppins">
      <li class="center-text" [class.active]="activeView == 0" (click)="activeViewChange.emit(activeView = 0)" ><ng-content select="[tab_0]"></ng-content></li>
      <li class="center-text" [class.active]="activeView == 1" (click)="activeViewChange.emit(activeView = 1)" ><ng-content select="[tab_1]"></ng-content></li>
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
  customHeader: boolean = false;


  @Output()
  filterClicked = new EventEmitter<never>();

  @Input()
  name: string = '{{ name }}';
};