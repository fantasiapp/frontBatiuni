import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UIDefaultAccessor } from "src/common/classes";

@Component({
  selector: "fileinput",
  templateUrl: "./file.ui.html",
  styleUrls: ["./file.ui.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: FileUI
  }]
})
export class FileUI extends UIDefaultAccessor<FileList> {
  @Input()
  filename : string = "Kbis";

  @Input()
  comment : string = "(Moins que 3 mois)"

  @Input()
  imgsrc : string = "";

  @Input()
  placeholder: string = "Veuillez télécharger un document."

  @Input()
  showtitle : boolean = false;

  @Input()
  includeDate: boolean = true;

  constructor() {
    super();
  }
  
  getInput(e: any) {
    let input = e.target as HTMLInputElement;
    return input.files;
  }
}