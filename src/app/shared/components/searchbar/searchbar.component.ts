import { Component } from "@angular/core";
import { UIDefaultAccessor } from "src/common/classes";

@Component({
  selector: 'searchbar',
  templateUrl: 'searchbar.component.html',
  styleUrls: ['searchbar.component.scss']
})
export class SearchbarComponent extends UIDefaultAccessor<string> {
  constructor() {
    super();
    this.value = '';
  }

  protected getInput(e: any) {
    return e.target.value;
  }
};