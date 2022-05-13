import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit } from "@angular/core";
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
          <label>Date de mission</label>
          <input type="date" class="form-element" formControlName="date"/>
          <img src="assets/calendar.png"/>
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
          <label class="form-title">Réorganiser la liste selon</label>
          <ng-container *ngSwitchCase="0">
            <div class="switch-container flex center-cross">
              <span class="criteria" (click)="sortDraftDate.onChangeCall()">Les brouillons les plus anciens</span> 
              <switch class="default" formControlName="sortDraftDate" #sortDraftDate></switch>
            </div>
            <div class="switch-container flex center-cross">
              <span class="criteria" (click)="sortDraftFull.onChangeCall()">Les brouillons les plus complets</span> 
              <switch class="default" formControlName="sortDraftFull" #sortDraftFull></switch>
            </div>
          </ng-container>
          <ng-container *ngSwitchCase="1">
            <div class="switch-container flex center-cross">
              <span class="criteria" (click)="sortPostResponse.onChangeCall()">Annonces contentant des réponses en premier</span> 
              <switch class="default" formControlName="sortPostResponse" #sortPostResponse></switch>
            </div>
          </ng-container>
          <ng-container *ngSwitchCase="2">
            <div class="switch-container flex center-cross">
              <span class="criteria" (click)="sortMissionNotifications.onChangeCall()">Annonces contentant des notifications en premier</span> 
              <switch class="default" formControlName="sortMissionNotifications" #sortMissionNotifications></switch>
            </div>
          </ng-container>
        </div>
      </form>
      <!-- <online-filter-form [target]="activeView == 1 ? 'réponses' : 'notifications'" *ngSwitchDefault></online-filter-form> -->
    </ng-container>
  `,
  styles: [`
    @use 'src/styles/responsive' as *;

    :host {
      display: block;
      width: 100%;
    }

    form {
      
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
    sortPostResponse: new FormControl(false),
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
  
}