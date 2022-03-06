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
  fileContext!: FileContext;

  openWindow(url: string) {
    window.open(url);
  }
};