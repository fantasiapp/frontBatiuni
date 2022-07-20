import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { Establishement } from "src/models/new/data.interfaces";
import { Clear, Query, QueryAll } from "src/models/new/data.state";
@Component({
  selector: 'suggestion-box',
  template: `
    <ng-container *ngIf="(suggestions$ | async) as suggestions">
      <ul *ngIf="showSuggestions && suggestions.length">
        <li *ngFor="let suggestion of suggestions; index as i" (click)="choose(suggestion)">
          <b>{{suggestion.name}}</b>, <em>{{suggestion.address}}</em>
        </li>
      </ul>
    </ng-container>
  `,
  styles: [`
    @use 'src/styles/variables' as *;

    :host {
      width: 100%;
      /* position: absolute; */
      z-index: 10;
      max-height: 300px;
      overflow: hidden auto;
      background: white;
    }

    ul {
      margin: 3px;
      padding: 20px 0;
      box-shadow: 0 4px 6px 0 #ccc;
    }

    li {
      padding: 5px 20px;

      &:hover {
        background: $secondaryBackground;
        color: white;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UISuggestionBox {
  query: string = '';
  showSuggestions: boolean = false;
  
  @HostBinding('attr.tabindex') get nonFocusable() { return -1; }

  @QueryAll('Establishments')
  suggestions$!: Observable<Establishement[]>;

  constructor(private store: Store, private cd: ChangeDetectorRef) {}

  @Input('query')
  set setQuery(query: string | null) {
    if ( !query ) return;
    this.picked = false;
    this.query = query;
    this.store.dispatch(new this.action(query)).subscribe(() => {
      if ( !this.picked && !this.showSuggestions ) {
        this.showSuggestions = true;
        this.cd.markForCheck();
      }
    });
  };

  @Input()
  action: any;

  @Output()
  choice = new EventEmitter<Establishement>();

  picked: boolean = false;

  choose(suggestion: Establishement) {
    this.showSuggestions = false;
    this.picked = true;
    this.choice.emit(suggestion);
    this.store.dispatch(new Clear('Establishments'));
  }

  hideSuggestions() {
    this.showSuggestions = false;
    this.cd.markForCheck();
  }

  cancel() {
    this.hideSuggestions();
    this.picked = false;
  }
}; 