import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter, ViewChild, ElementRef } from "@angular/core";
import { AbstractControl, FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { UIAsyncAccessor } from "src/app/shared/common/classes";
import { Serialized } from "src/app/shared/common/types";
import { FilesRow } from "src/models/data/data.model";

export type FileUIOutput = Omit<Omit<Serialized<FilesRow>, 'id'>, 'timestamp'>;
export function defaultFileUIOuput(nature: string = '', date?: string, name?: string): FileUIOutput {
  const now = new Date;

  return {
    content: '',
    expirationDate: date || '',
    ext: '???',
    name: name || 'Veuillez télécharger un document',
    nature
  };
}

@Component({
  selector: 'fileinput',
  templateUrl: "./file.ui.html",
  styleUrls: ["./file.ui.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: FileUI
  }]
})
export class FileUI extends UIAsyncAccessor<FileUIOutput> {
  @Input()
  filename: string = "Kbis";

  @Output()
  filenameChange = new EventEmitter<string>();

  @Output()
  kill = new EventEmitter();

  @Output()
  requestFileMenu = new EventEmitter();

  @Input()
  editName: false | any = false;

  @Input()
  comment : string = "(Moins que 3 mois)"

  @Input()
  imgsrc : string = "";

  @Input()
  showtitle : boolean = false;

  @Input()
  includeDate: boolean = true;

  @ViewChild('input', {static: true, read: ElementRef})
  inputRef!: ElementRef;

  constructor(cd: ChangeDetectorRef) {
    super(cd);
  }

  ngOnInit() {
    this.value = {
      content: '',
      expirationDate: '',
      ext: '???',
      name: 'Veuillez télécharger un document',
      nature: this.filename
    };
  }

  private getBase64(files: FileList, index: number = 0) {
    const reader = new FileReader();
    reader.readAsDataURL(files.item(index)!);
    return new Promise((res, rej) => {
      reader.onload = () => res(reader.result);
      reader.onerror = (error) => rej('Error: ' + error);
    });
  };

  //override 
  
  async getInput(e: {origin: string; event: any}): Promise<FileUIOutput> {
    let input = e.event.target as HTMLInputElement;
    if ( e.origin == 'date' ) {
      if ( !input.value ) return this.value!;
      const newDate = input.value.slice(0, 10);
      return {...this.value, expirationDate: newDate} as FileUIOutput;
    }

    if ( !input.files ) return this.value as FileUIOutput;

    const base64 = await this.getBase64(input.files!) as string,
      fullname = input.files.item(0)!.name,
      lastDot = fullname.lastIndexOf('.'),
      name = fullname.slice(0, lastDot),
      ext = fullname.slice(lastDot + 1);

    return {...this.value, content: base64.slice(FilesRow.getFileType(ext).length + 13), name, ext} as FileUIOutput;
  }

  onFilenameChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.filenameChange.emit(input.value);
  }

  close() { this.kill.emit(); }

  onFileInputClicked(e: Event) {
    //if ( e.isTrusted ) e.preventDefault();
  }
}