import { Optional } from "./types";

export function nullable<T>(x: T) { return !x; }
export function nonNullable<T>(x: T) { return !!x; }

export function filterMap<U, V>(array: U[], mapping: (x: U) => Optional<V>): V[] {
  return array.map(mapping).filter(nonNullable) as V[];
};

export function filterSplit<U>(array: U[], pred: (x: U) => boolean) {
  let accepted: U[] = [],
    rejected: U[] = [];
  
  array.forEach(x => {
    if ( pred(x) ) accepted.push(x);
    else rejected.push(x);
  }); return [accepted, rejected];
};

export function getByValue<K, V>(map: Map<K, V>, searchValue: V): K | null {
  for (let [key, value] of map.entries()) {
    if (value === searchValue)
      return key;
  }
  return null;
}


export function getDirtyValues(form: any) {
  let dirtyValues: any = {};

  Object.keys(form.controls)
  .forEach(key => {
    let currentControl = form.controls[key];

    if ( currentControl.dirty ) {
      if ( currentControl.controls )
        dirtyValues[key] = currentControl.value; //getDirtyValues(currentControl);
      else
        dirtyValues[key] = currentControl.value;
    }
  });

  return dirtyValues;
};

const alphanum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export function makeid(length: number) {
  let result = '';
  const charactersLength = alphanum.length;
  for ( let i = 0; i < length; i++ )
    result += alphanum.charAt(Math.floor(Math.random() * charactersLength));
  return result;
};

export function getTopmostElement(element: HTMLElement) {
  while ( element.parentElement && element.parentElement !== document.body)
    element = element.parentElement;
  return element;
};

export function focusOutside(element: HTMLElement | null, target: HTMLElement) {
  const topmost = getTopmostElement(target).parentElement !== null;

  if ( !topmost ) return false; //if the element left the dom
  if ( !element?.contains(target) ) return true;
  return false;
};

/*https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors*/
export function shadeColor(color: string, percent: number) {
  let R = parseInt(color.substring(1,3),16);
  let G = parseInt(color.substring(3,5),16);
  let B = parseInt(color.substring(5,7),16);

  R = R * ((100 + percent) / 100) | 0;
  G = G * ((100 + percent) / 100) | 0;
  B = B * ((100 + percent) / 100) | 0; //cast back to int
  R = (R<255)?R:255;  
  G = (G<255)?G:255;  
  B = (B<255)?B:255;  

  const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
  const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
  const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
  return "#"+RR+GG+BB;
};

/*https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript*/
export const b64toBlob = (b64Data: string, contentType='', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
};

let imageExtension = ['png', 'jpeg', 'jpg', 'svg', 'heic'];
export function getFileType(ext: string) {
  if ( imageExtension.includes(ext) ) return 'image/' + ext;
  return 'application/' + ext;
}