import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { UIDefaultAccessor } from "src/app/shared/common/classes";

@Component({
  selector: 'searchbar',
  templateUrl: 'searchbar.component.html',
  styleUrls: ['searchbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarComponent extends UIDefaultAccessor<string> {
  constructor(cd: ChangeDetectorRef) {
    super(cd);
    this.value = '';
  }

  @Input()
  placeholder: string = "Rechercher une annonce";

  protected getInput(e: any) {
    return e.target.value;
  }
};