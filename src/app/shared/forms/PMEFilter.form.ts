import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Store } from "@ngxs/store";
import { Job } from "src/models/new/data.interfaces";
import { SnapshotAll } from "src/models/new/data.state";

@Component({
  selector: 'pme-filter-form',
  template: `
    <ng-container [ngSwitch]="activeView">
      <form class="form-control full-width" [formGroup]="filterForm">

        <div class="form-input">
          <label>Date de démarrage</label>
          <div class="form-input flex row space-between">
            <input type="date" style="padding-left: 0.5rem;" class="form-element" formControlName="date" #inputDateMission/>
            <img src="assets/calendar.png" (click)="inputDateMission.select()" class="img-calendar-since" style="pointer-events: none;"/>
          </div>
        </div>

        <div class="form-input">
          <label>Adresse de chantier</label>
          <input type="text" class="form-element" formControlName="address"/>
        </div>

        <div class="form-input form-spacer">
          <label>Métier</label>
          <options [options]="allJobs" formControlName="jobs"></options>
        </div>

        <div class="form-input form-spacer">
          <label class="form-title">Type</label>
          <div class="flex row radio-container">
            <div class="radio-item">
              <radiobox class="grow" onselect="true" name="job-type" formControlName="manPower" #manPower1></radiobox>
              <span (click)="manPower1.onChange($event)">Main d'oeuvre</span>
            </div>
            <div class="radio-item">
              <radiobox class="grow" onselect="false" name="job-type" formControlName="manPower" #manPower2></radiobox>
              <span (click)="manPower2.onChange($event)">Fourniture et pose</span>
            </div>
          </div>
        </div>

        <div class="form-input">
          <ng-container *ngSwitchCase="0">
          <label class="form-title">Réorganiser la liste selon</label>
            <div class="switch-container flex center-cross">
              <span class="criteria" (click)="sortDraftDate.onChangeCall()">Les brouillons les plus anciens</span> 
              <switch class="default" formControlName="sortDraftDate" #sortDraftDate></switch>
            </div>
            <div class="switch-container flex center-cross">
              <span class="criteria" (click)="sortDraftFull.onChangeCall()">Les brouillons les plus complets</span> 
              <switch class="default" formControlName="sortDraftFull" #sortDraftFull></switch>
            </div>
          </ng-container>
          <ng-container *ngSwitchCase="2">
          <label class="form-title">Réorganiser la liste selon</label>
            <div class="switch-container flex center-cross">
              <span class="criteria" (click)="sortMissionNotifications.onChangeCall()">Annonces contentant des notifications en premier</span> 
              <switch class="default" formControlName="sortMissionNotifications" #sortMissionNotifications></switch>
            </div>
          </ng-container>
        </div>

        <footer
        class="flex row space-between sticky-footer full-width submit-container"
        style="background-color: white;">
          <div class="action-button-filter flex row space space-between full-width">
            <button class="button passive" (click)="onResetFilter()">Réinitialiser</button>
            <button class="button active" (click)="onCloseFilter()">Valider</button>
          </div>
        </footer>
      </form>
      <!-- <online-filter-form [target]="activeView == 1 ? 'réponses' : 'notifications'" *ngSwitchDefault></online-filter-form> -->
    </ng-container>
  `,
  styles: [`
    @use 'src/styles/responsive' as *;

    :host {
      display: block;
      width: 100%;
      padding-bottom: 3rem;
    }

    .form-title {
      margin-bottom: 0.5rem
    }
    
    switch::ng-deep .slider {
      background: #ccc;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PMEFilterForm implements OnInit {
  //determine which filter is open
  @Input()
  activeView: number = 0;

  @Input()
  callbackFilter: Function = () => {};

  filterForm = new FormGroup({
    date: new FormControl(""),
    address: new FormControl(""),
    jobs: new FormControl([]),
    manPower: new FormControl(undefined),
    sortDraftDate: new FormControl(false),
    sortDraftFull: new FormControl(false),
    sortMissionNotifications: new FormControl(false),
  },
    {}
  );

  constructor(private store: Store){}

  @SnapshotAll('Job')
  allJobs!: Job[];

  ngOnInit(){
    this.callbackFilter(this.filterForm.value);
    this.filterForm.valueChanges.subscribe(value => {
      this.callbackFilter(value);
    })
  }

  @Output() closeFilter = new EventEmitter()
  onCloseFilter(){
    this.closeFilter.next()
  }
  onResetFilter(){
    this.filterForm.reset();
  }
}