import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "fileinput",
  templateUrl: "./file.ui.html",
  styleUrls: ["./file.ui.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUI {
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

  @Output()
  filesChange = new EventEmitter<FileList>();
  files: FileList | undefined;

  onChange(e: any) {
    let input = e.target as HTMLInputElement;
    console.log(e, input.files);
    this.filesChange.emit(this.files = input.files!);
  }
}