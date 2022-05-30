import { ChangeDetectionStrategy, Component, Input, ViewRef } from "@angular/core";
import { SafeResourceUrl } from "@angular/platform-browser";

export type FileContext = {
  url: string;
  safeUrl: SafeResourceUrl,
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
  fileContextList!: FileContext[];

  displayModal: boolean = false;
  modalImage: SafeResourceUrl = "";

  ngOnInit() {
    console.log("init", this.fileContextList)
  }

  openWindow(url: string) {
    console.log(this.fileContextList)
    window.open(url);
  }

  openModalImage(image: SafeResourceUrl) {
    console.log(image);
    this.displayModal = true;
    this.modalImage = image;

  }

  closeModalImage() {
    console.log("close image")
    this.displayModal = false;
    this.modalImage = "";
  }
};