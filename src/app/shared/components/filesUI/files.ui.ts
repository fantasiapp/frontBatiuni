import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter, ViewChild, ElementRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { UIAsyncAccessor } from "src/app/shared/common/classes";
import { File } from "src/models/new/data.interfaces";
import { getFileType } from "../../common/functions";
import { InfoService } from "../info/info.component";
import { PopupService } from "../popup/popup.component";
import { SwipeupService } from "../swipeup/swipeup.component";

export type BasicFile = {
  nature: string;
  name: string;
  ext: string;
  content: string;
}

export type FileUIOutput = BasicFile & {expirationDate: string; id?: number};
export function defaultFileUIOuput(nature: string = '', date?: string, name?: string): FileUIOutput {

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

  constructor(cd: ChangeDetectorRef, private popup: PopupService, private info: InfoService, private swipeup: SwipeupService) {
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

    return {...this.value, content: base64.slice(getFileType(ext).length + 13), name, ext} as FileUIOutput;
  }

  onFilenameChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.filenameChange.emit(input.value);
  }

  close() {
    this.kill.emit();
  }

  openInput() { this.inputRef.nativeElement.click(); }

  private async takePhoto() {
    const photo = await Camera.getPhoto({
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });

    this.value = {
      expirationDate: '',
      nature: '',
      name: photo.path || 'image du caméra',
      ext: photo.format,
      content: photo.base64String as string    
    };

    this.valueChange.emit(this.value);
    this.onChanged(this.value);
    this.onTouched();
    this.cd.markForCheck();
  }

  onFileInputClicked(e: Event) {
    if ( e.isTrusted ) e.preventDefault();

    this.swipeup.show({
      type: 'menu',
      hideOnClick: true,
      items: [{
        name: 'Supprimer un Fichier',
        click: () => {
          //search file having the same name and delete it
          console.log(this._value);
        }
      }, {
        name: 'Accéder au caméra',
        click: async () => {
          let permissions = await Camera.checkPermissions();
          if ( permissions.camera != 'granted' ) {
            //try to get permission
            permissions = await Camera.requestPermissions({permissions: ['camera']});
            if ( permissions.camera !='granted' )
              return this.info.show("error", "L'Accès au caméra n'est pas accordé", 3000);
            
            this.takePhoto();
          } else this.takePhoto();
        }
      }, {
        name: 'Télécharger un fichier',
        click: () => {
          this.openInput();
        }
      }, {
        name: 'Visualiser un fichier',
        click: () => {
          console.log(this.value);
          if ( !this.value || (!this.value.content && (this.value.id == void 0)) )
            return this.info.show("error", "Aucun fichier à affichier", 3000);
          
          this.popup.openFile(this.value);
        }
      }]
    })
  }
}