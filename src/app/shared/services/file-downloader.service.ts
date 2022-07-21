import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Store } from "@ngxs/store";
import { Observable, of } from "rxjs";
import { map, take } from "rxjs/operators";
import { File } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";
import { DownloadFile } from "src/models/new/user/user.actions";
import { b64toBlob, getFileType } from "../common/functions";
import { BasicFile, FileUIOutput } from "../components/filesUI/files.ui";
import { FileContext } from "../components/file-viewer/file-viewer.component";
import { Content } from "@angular/compiler/src/render3/r3_ast";

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

    console.log('createFileContext', file, type, blobType);
    
    let blob
    if(Array.isArray(file.content)){
      blob = file.content.map((content: string) => {

        // je sais pas pourquoi je fais cette ligne mais elle marche, le FileReader met un ',' au debut des .jpg qui fait planter
        if(type == 'image/jpg' && content.charAt(0) == ',') content = content.slice(1)
        return b64toBlob(Array.isArray(content) ? content[0] : content, blobType)
      })
    } else {
      blob = [b64toBlob(Array.isArray(file.content) ? file.content[0] : file.content, blobType)]
    }

    console.log('blob', blob);
    const url = blob.map((blob: Blob) => {
      return URL.createObjectURL(blob)
    })
    console.log('url', url);

    const context: FileContext = {
      type,
      url,
      safeUrl: url.map((url: string) => {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url)
      }),
    };

    console.log('context', context);
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
        // hello")
        return this.store.selectSnapshot(DataQueries.getById("File", id))!;
      })
    );
  }
}
