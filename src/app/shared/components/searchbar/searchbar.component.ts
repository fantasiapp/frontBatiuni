import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { UIDefaultAccessor } from "src/app/shared/common/classes";

@Component({
  selector: 'searchbar',
  templateUrl: 'searchbar.component.html',
  styleUrls: ['searchbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarComponent extends UIDefaultAccessor<string> {
  constructor() {
    super();
    this.value = '';
  }

  @Input()
  placeholder: string = "Recherche une annone";

  protected getInput(e: any) {
    return e.target.value;
  }
};