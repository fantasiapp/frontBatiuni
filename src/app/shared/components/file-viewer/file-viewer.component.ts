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

  displayModal: boolean = false;
  modalImage: SafeResourceUrl = "";

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    console.log("init", this.fileContext)
  }

  openWindow(url: string) {
    console.log(this.fileContext)
    window.open(url);
  }

  openModalImage(image: SafeResourceUrl) {
    console.log(image);
    this.displayModal = true;
    this.modalImage = image;
    this.cd.markForCheck();
  }

  closeModalImage() {
    console.log("close image")
    this.displayModal = false;
    this.modalImage = "";
  }
};