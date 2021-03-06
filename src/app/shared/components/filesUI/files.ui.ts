import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { DocumentScanner, ResponseType } from "capacitor-document-scanner";
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
  content: string[];
};

export type FileUIOutput = BasicFile & { expirationDate: string; id?: number };
export function defaultFileUIOuput(
  nature: string = "",
  date?: string,
  name?: string
): FileUIOutput {
  return {
    content: [""],
    expirationDate: date || "",
    ext: "???",
    name: name || "Veuillez télécharger un document",
    nature,
  };
}

@Component({
  selector: "fileinput",
  templateUrl: "./file.ui.html",
  styleUrls: ["./file.ui.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: FileUI,
    },
  ],
})
export class FileUI extends UIAsyncAccessor<FileUIOutput> {
  @Input() filename: string = "Kbis";

  @Input() name : string = 'Kbis'
  @Input() nature: string = ''
  @Output()
  filenameChange = new EventEmitter<string>();

  @Output()
  kill = new EventEmitter();

  @Output()
  requestFileMenu = new EventEmitter();

  @Input()
  editName: false | any = false;

  @Input()
  comment: string = "(Moins de 3 mois)";

  @Input()
  imgsrc: string = "";

  @Input()
  showtitle: boolean = false;

  @Input()
  includeDate: boolean = true;

  @Input()
  closeButton: boolean = true;

  @ViewChild("input", { static: true, read: ElementRef })
  inputRef!: ElementRef;

  modified: boolean = false;

  constructor(
    cd: ChangeDetectorRef,
    private popup: PopupService,
    private info: InfoService,
    private swipeup: SwipeupService
  ) {
    super(cd);
  }

  ngOnInit() {
    this.value = {
      content: [""],
      expirationDate: "",
      ext: "???",
      name: this.nature == 'labels' ? this.filename : "Veuillez télécharger un document",
      nature: this.nature,
    };
  }

  private getBase64(files: FileList, index: number = 0) {
    const reader = new FileReader();
    reader.readAsDataURL(files.item(index)!);
    return new Promise((res, rej) => {
      reader.onload = () => res(reader.result);
      reader.onerror = (error) => rej("Error: " + error);
    });
  }

  //override

  // async getInput(e: { origin: string; event: any }): Promise<FileUIOutput> {
  //   let input = e.event.target as HTMLInputElement;
  //   if (e.origin == "date") {
  //     if (!input.value) return this.value!;
  //     const newDate = input.value.slice(0, 10);
  //     return { ...this.value, expirationDate: newDate } as FileUIOutput;
  //   }

  //   if (!input.files) return this.value as FileUIOutput;

    
  //   const base64 = (await this.getBase64(input.files!)) as string,
  //     fullname = input.files.item(0)!.name,
  //     lastDot = fullname.lastIndexOf("."),
  //     name = fullname.slice(0, lastDot),
  //     ext = fullname.slice(lastDot + 1);

  //   if (((this.value?.nature == "admin" || this.value?.expirationDate )  || this.value?.nature.includes('Quali') ) && this.filename !== 'Kbis') {
  //     // this.popup.newFile(this.filename, this);
  //     this.info.show("error", "Veuillez ajouter une date pour le document "+ this.filename, 5000 )
  //   }
  //   return {
  //     ...this.value,
  //     content: [base64.slice(getFileType(ext).length + 13)],
  //     name,
  //     ext,
  //   } as FileUIOutput;
  // }

  onFilenameChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.filenameChange.emit(input.value);
  }

  close() {
    this.kill.emit();
  }
  
  async onChange(e: any) {
    // if ( this.isDisabled ) { e.preventDefault?.(); return; }
    e.event.preventDefault()
    console.log('OVERRIDE');
    this.set(this.value!);
  };

  openInput() {
    this.inputRef.nativeElement.click();
    this.modified = true;
    this.valueChange.emit(this.value)
  }

  private async takePhoto() {
    const photo = await Camera.getPhoto({
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      webUseInput: true,
      quality: 60
    });

    this.value = {
      expirationDate: "",
      // nature: "",
      nature: this.value!.nature,
      name: photo.path || "Image téléchargée depuis la gallerie",
      ext: photo.format,
      content: [photo.base64String as string],
    };
  }

  // OVERRIDE
  // async getInput(e: {origin: string; event:any}): Promise<FileUIOutput> {
  //   e.event.preventDefault()

  //   return {
  //     ...this.value!
  //   }
  // }

  deleteFile(){
    if (this.value?.nature == "admin") {this.kill.emit({filename: this.value?.name, fileUI: this});}
    else {this.kill.emit({filename : this.filename, fileUI: this})}
    this.value = {
      content: [""],
      expirationDate: "",
      ext: "???",
      name: this.nature == 'labels'? this.filename : "Veuillez télécharger un document",
      nature: this.nature,
    };
    this.cd.markForCheck()
    
  }

   private async scanDocument() {
    // start the document scanner
    const {scannedImages} = await DocumentScanner.scanDocument({
      maxNumDocuments: 1,
      responseType: ResponseType.Base64,
    })
    
    console.log('scanenrImages', scannedImages);
    if (scannedImages && scannedImages.length > 0) {

      // let base64 = Capacitor.convertFileSrc(scannedImages[0])
      // let extension = base64.split(".").pop()!;
      // console.log('base64', base64);
      this.value = {
        expirationDate: "",
        nature: "",
        name: "Document scanné",
        ext: 'jpg',
        content: [scannedImages[0] as string],
      };
    }
    if (this.value?.nature == "admin") {
      // this.popup.newFile(this.filename, this);
      this.info.show("error", "Veuillez ajouter une date pour le document "+ this.filename, 5000 )

    }
  }

  onFileInputClicked(e: Event) {
    if (e.isTrusted) e.preventDefault();

    this.swipeup.show({
      type: "menu",
      hideOnClick: true,
      items: [
        {
          name: "Supprimer un fichier",
          click: () => {
            if (this.value?.nature == "post") {
              this.value = {
                content: [""],
                expirationDate: "",
                ext: "???",
                name: "Veuillez télécharger un document",
                nature: this.value.nature,
              };
              this.kill.emit();
              this.cd.markForCheck()
            } else {
              this.popup.deleteFile(this.filename, this)
            }
          },
        },
        {
          name: "Scanner un ficher avec la camera",
          click: async () => {
            let permissions = await Camera.checkPermissions();
            if (permissions.camera != "granted") {
              //try to get permission
              permissions = await Camera.requestPermissions({
                permissions: ["camera"],
              });
              if (permissions.camera != "granted")
                return this.info.show(
                  "error",
                  "L'accès à la caméra n'est pas accordé",
                  3000
                );

              this.scanDocument();
            } else this.scanDocument();
          },
        },
        {
          name: "Télécharger un fichier",
          click: async () => {
            // this.openInput();

            await this.takePhoto()
            this.openInput()
          },
        },
        {
          name: "Visualiser un fichier",
          click: () => {
            console.log('value file', this.value)
            if (!this.value || (!this.value.content && this.value.id == void 0))
              return this.info.show("error", "Aucun fichier à affichier", 3000);

            let canOpenPDF = !this.modified;
            this.popup.openFile(this.value, canOpenPDF);
          },
        },
      ],
    });
  }
}
