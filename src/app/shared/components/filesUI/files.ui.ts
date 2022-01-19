import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UIDefaultAccessor } from "src/common/classes";

export type FileinputOutput = {
  files: FileList | null | undefined;
  date: string | undefined;
};

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
export class FileUI extends UIDefaultAccessor<FileinputOutput> {
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
    this.value = {files: null, date: this.now};
  }
  
  getInput(e: {origin: string; event: any}): FileinputOutput {
    let input = e.event.target as HTMLInputElement;
    if ( e.origin == 'date' ) {
      if ( !input.value ) return this.value!;
      const newDate = input.value.slice(0, 10);
      return this.value ? ({ files: this.value.files, date: newDate }) : ({ files: null, date: newDate });
    }

    const currentDate = (new Date).toISOString().slice(0, 10);
    return this.value ? ({ files: input.files, date: this.value.date || currentDate }) : ({ files: input.files, date: currentDate });
  }

  get now() {
    return (new Date).toISOString().slice(0, 10)
  }
}