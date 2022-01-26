import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { Serialized } from "src/app/shared/common/types";
import { EstablishmentsRow } from "src/models/data/data.model";
import { MiscState } from "src/models/misc/misc.state";

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
    @import 'src/styles/variables';

    :host {
      width: 100%;
      position: absolute;
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
  showSuggestions: boolean = true;
  
  @HostBinding('attr.tabindex') get nonFocusable() { return -1; }

  @Select(MiscState.get('register.company'))
  suggestions$!: Observable<EstablishmentsRow[]>;

  constructor(private store: Store) {}

  @Input('query')
  set setQuery(query: string | null) {
    if ( !query ) return;
    this.query = query;
    this.store.dispatch(new this.action(query, 'register.company')).subscribe(console.log);
  };

  @Input()
  action: any;

  @Output()
  choice = new EventEmitter<EstablishmentsRow>();

  choose(suggestion: EstablishmentsRow) {
    this.showSuggestions = false;
    this.choice.emit(suggestion);
  }
};