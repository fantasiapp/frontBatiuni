import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'tabs',
  template: `
    <ul class="tabs flex row font-Poppins" [class.three_tabs]="tabs == 3">
      <li class="center-text" [class.active]="activeView == 0" (click)="activeViewChange.emit(activeView = 0)" ><ng-content select="[tab_0]"></ng-content></li>
      <li class="center-text" [class.active]="activeView == 1" (click)="activeViewChange.emit(activeView = 1)" ><ng-content select="[tab_1]"></ng-content></li>
      <li *ngIf="tabs > 2" class="center-text" [class.active]="activeView == 2" (click)="activeViewChange.emit(activeView = 2)" ><ng-content select="[tab_2]"></ng-content></li>
    </ul>
  `,
  styles: [`
    @import 'src/styles/variables';
    
    :host { display: block; width: 100%; }
    ul { margin: 0 auto; max-width: 450px + 20px; }
    li { flex: 0 0 150px; height: $tab-height; }
    li.active { font-weight: 700; color: $buttonGradient; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent {
  
  @Input()
  activeView: number = 0;

  @Output()
  activeViewChange = new EventEmitter<number>();

  @Input()
  tabs: 2 | 3 = 2;
};