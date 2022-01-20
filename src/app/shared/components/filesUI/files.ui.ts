import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UIAsyncAccessor } from "src/common/classes";
import { Serialized } from "src/common/types";
import { FilesRow } from "src/models/data/data.model";

export type FileUIOutput = Omit<Omit<Serialized<FilesRow>, 'id'>, 'timestamp'>;
export function defaultFileUIOuput(nature: string = '', date?: string): FileUIOutput {
  const now = new Date,
      expirationDate = date || now.toISOString().slice(0, 10);

  return {
    content: '',
    expirationDate,
    ext: '???',
    name: 'Veuillez télécharger un document',
    nature
  };
}

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
export class FileUI extends UIAsyncAccessor<FileUIOutput> {
  @Input()
  filename : string = "Kbis";

  @Input()
  comment : string = "(Moins que 3 mois)"

  @Input()
  imgsrc : string = "";

  @Input()
  showtitle : boolean = false;

  @Input()
  includeDate: boolean = true;

  constructor(cd: ChangeDetectorRef) {
    super(cd);
  }

  ngOnInit() {
    const date = new Date,
      expirationDate = date.toISOString().slice(0, 10);

    this.value = {
      content: '',
      expirationDate,
      ext: '???',
      name: 'Veuillez télécharger un document',
      nature: this.filename
    };
  }

  private getBase64(files: FileList, index: number = 0) {
    const reader = new FileReader();
    reader.readAsDataURL(files.item(0)!);
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
      name = input.files.item(0)!.name,
      ext = name.slice(name.lastIndexOf('.') + 1);
    
    console.log({...this.value, content: base64, name, ext} as FileUIOutput);
    return {...this.value, content: base64, name, ext} as FileUIOutput;
  }
}