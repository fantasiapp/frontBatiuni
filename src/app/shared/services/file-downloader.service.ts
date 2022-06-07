import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Store } from "@ngxs/store";
import { Observable, of } from "rxjs";
import { map, take } from "rxjs/operators";
import { File } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";
import { DownloadFile } from "src/models/new/user/user.actions";
import { b64toBlob, getFileType } from "../common/functions";
import { BasicFile } from "../components/filesUI/files.ui";
import { FileContext } from "../components/file-viewer/file-viewer.component";

@Injectable()
export class FileDownloader {
  constructor(private sanitizer: DomSanitizer, private store: Store) {}

  toSecureBase64(file: BasicFile) {
    //assume downloaded
    if (!file.content) throw `Download file before using base64`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `data:${getFileType(file.ext)};base64,${file.content}`
    );
  }

  createFileContext(file: any): FileContext {
    const type = getFileType(file.ext)
    let blobType = type
    if (type == 'application/pdf') {
      blobType = 'image/jpeg'
    }
    const blob = file.content.map((content: string) => {
      return b64toBlob(
        Array.isArray(content) ? content[0] : content,
        blobType
      )
    })
    const url = blob.map((blob: Blob) => {
      return URL.createObjectURL(blob)
    })
    const context: FileContext = {
        type,
        url,
        safeUrl: url.map((url: string) => {
          return this.sanitizer.bypassSecurityTrustResourceUrl(url)
          }),
      };

    return context;
  }

  clearContext(fileContext: FileContext) {
    fileContext.url.length && URL.revokeObjectURL(fileContext.url[0]);
  }

  downloadFile(file: File | number, notify: boolean = false, forceDownload: boolean = false): Observable<File> {
    let id: number;
    if (typeof file == "number") id = file;
    else if (file.content) return of(file);
    else id = file.id;
    return this.store.dispatch(new DownloadFile(id, notify, forceDownload)).pipe(
      take(1), //will unsubscribe
      map((_) => {
        // console.log("hello")
        return this.store.selectSnapshot(DataQueries.getById("File", id))!;
      })
    );
  }
}
