import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, ViewChild, ViewRef } from "@angular/core";
import { SafeResourceUrl } from "@angular/platform-browser";

export type FileContext = {
  url: string[];
  safeUrl: SafeResourceUrl[],
  type: string,
};

//simple component for showing images
@Component({
  selector: 'file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileViewer {

  @Input()
  fileContext!: FileContext;

  @Input()
  canOpenPDF: boolean = true;

  displayModal: boolean = false;
  modalImage: SafeResourceUrl = "";

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    // console.log("init", this.fileContext)
  }

  openWindow(url: string) {
    window.open(url);
  }

  openModalImage(image: SafeResourceUrl) {
    console.log("coucou")
    this.displayModal = true;
    this.modalImage = image;
    this.cd.markForCheck();
  }

  closeModalImage() {
    this.displayModal = false;
    this.modalImage = "";
  }
};