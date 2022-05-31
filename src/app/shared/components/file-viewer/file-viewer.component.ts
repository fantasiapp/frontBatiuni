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
  }

  openWindow(url: string) {
    window.open(url);
  }

  openModalImage(image: SafeResourceUrl) {
    this.displayModal = true;
    this.modalImage = image;

  }

  closeModalImage() {
    this.displayModal = false;
    this.modalImage = "";
  }
};