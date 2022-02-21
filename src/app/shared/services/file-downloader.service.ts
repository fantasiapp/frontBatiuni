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
import { FileViewConfig } from "../components/popup/popup.component";

@Injectable()
export class FileDownloader {
  constructor(private sanitizer: DomSanitizer, private store: Store) {

  }

  toSecureBase64(file: BasicFile) {
    //assume downloaded
    if ( !file.content )
      throw `Download file before using base64`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(`data:${getFileType(file.ext)};base64,${file.content}`)
  }

  createFileContext(file: BasicFile) {
    const type = getFileType(file.ext),
      blob = b64toBlob(Array.isArray(file.content) ? file.content[0] : file.content, type),
      url = URL.createObjectURL(blob),
      context: FileViewConfig = {$implicit: {
        type,
        url,
        safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
        close() { this.url && URL.revokeObjectURL(this.url) }
      }};
    
    return context;
  }

  downloadFile(file: File | number): Observable<File> {
    let id: number;
    if ( typeof file == 'number' )
      id = file;
    else
      if ( file.content ) return of(file);
      else id = file.id
    
    return this.store.dispatch(new DownloadFile(id)).pipe(
      take(1), //will unsubscribe
      map(_ => {
        return this.store.selectSnapshot(DataQueries.getById('File', id))!
      })
    );
  }
};